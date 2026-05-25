import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { CreateConversationUseCase } from '../../../application/use-cases/chat/create-conversation.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/chat/send-message.use-case';
import type { IConversationRepository } from '../../../domain/interfaces/repositories/chat/conversation.repository.interface';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { MessagePayloadDTO } from '../../../presentation/dto/chatDTO/message-payload.dto';
import { MessageChannel } from '../../enums/message-channel.enum';
import { MessageOrigin } from '../../enums/message-origin.enum';
import { ChatGateway } from '../../gateways/chat.gateway';
import { ChatProducer } from '../producers/chat.producer';
import { QUEUES, RabbitMQService } from '../rabbitmq.service';

/**
 * Consumer da fila whatsapp.incoming.
 * Fluxo:
 *   1. Recebe mensagem do paciente via WhatsApp
 *   2. Localiza conversa pelo patientId (ou cria se não existir)
 *   3. Persiste a mensagem no banco
 *   4. Emite via WebSocket para o médico responsável
 *   5. Encaminha para IA (chat.to_ai)
 */
@Injectable()
export class WhatsappIncomingConsumer implements OnModuleInit {
  private readonly logger = new Logger(WhatsappIncomingConsumer.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly chatGateway: ChatGateway,
    private readonly chatProducer: ChatProducer,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly createConversationUseCase: CreateConversationUseCase,
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.consume(
      QUEUES.WHATSAPP_INCOMING,
      this.handle.bind(this),
    );
    this.logger.log(`Consumer registrado: ${QUEUES.WHATSAPP_INCOMING}`);
  }

  private async handle(raw: unknown): Promise<void> {
    const payload = raw as MessagePayloadDTO;

    this.logger.debug(`Mensagem recebida de ${payload.patientId} via WhatsApp`);

    // Busca conversa existente ou tenta pelo conversationId no payload
    let conversationId = payload.conversationId;
    let resolvedPatientId = payload.patientId;

    if (!conversationId) {
      // payload.patientId contém o número de telefone enviado pelo gateway WhatsApp
      const phone = payload.patientId;
      const patient = await this.patientRepository.findByWhatsappPhone(phone);

      if (!patient || !patient.patientDoctors?.length) {
        this.logger.warn(
          `Nenhum paciente com WhatsApp ${phone} ou sem médico vinculado`,
        );
        return;
      }

      // Substitui o telefone pelo ID real do paciente no banco
      resolvedPatientId = patient.id;

      const doctorId = patient.patientDoctors[0].doctorId;

      // Busca ou cria conversa
      const existing = await this.conversationRepository.findByPatientAndDoctor(
        patient.id,
        doctorId,
      );

      if (existing) {
        conversationId = existing.id;
      } else {
        const newConversation = await this.createConversationUseCase.execute({
          patientId: patient.id,
          doctorId: doctorId,
          channel: MessageChannel.WHATSAPP,
        });
        conversationId = newConversation.id;
      }
    }

    // Persiste mensagem
    const message = await this.sendMessageUseCase.execute(conversationId, {
      content: payload.message,
      origin: MessageOrigin.PATIENT,
      channel: MessageChannel.WHATSAPP,
      metadata: payload.metadata,
    });

    // Notifica médico em tempo real via WebSocket
    this.chatGateway.emitNewMessage(conversationId, message);

    // Encaminha para IA processar (com patientId resolvido para o ID do banco)
    await this.chatProducer.publishToAI({
      ...payload,
      patientId: resolvedPatientId,
      conversationId,
    });
  }
}
