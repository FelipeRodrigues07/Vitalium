import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { SendMessageUseCase } from '../../../application/use-cases/chat/send-message.use-case';
import type { MessagePayloadDTO } from '../../../presentation/dto/chatDTO/message-payload.dto';
import { MessageChannel } from '../../enums/message-channel.enum';
import { MessageOrigin } from '../../enums/message-origin.enum';
import { ChatGateway } from '../../gateways/chat.gateway';
import { ChatProducer } from '../producers/chat.producer';
import { QUEUES, RabbitMQService } from '../rabbitmq.service';

/**
 * Consumer da fila chat.from_ai.
 * Fluxo:
 *   1. Recebe resposta gerada pela IA
 *   2. Persiste a mensagem com origin=AI
 *   3. Publica em chat.outgoing (para WhatsApp gateway enviar ao paciente)
 *   4. Emite via WebSocket para visibilidade do médico
 */
@Injectable()
export class AiResponseConsumer implements OnModuleInit {
  private readonly logger = new Logger(AiResponseConsumer.name);

  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly chatGateway: ChatGateway,
    private readonly chatProducer: ChatProducer,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitmq.consume(QUEUES.CHAT_FROM_AI, this.handle.bind(this));
    this.logger.log(`Consumer registrado: ${QUEUES.CHAT_FROM_AI}`);
  }

  private async handle(raw: unknown): Promise<void> {
    const payload = raw as MessagePayloadDTO;

    if (!payload.conversationId) {
      this.logger.warn('Resposta da IA sem conversationId — descartando');
      return;
    }

    this.logger.debug(
      `Resposta da IA recebida para conversa ${payload.conversationId}`,
    );

    // Persiste a mensagem da IA
    const message = await this.sendMessageUseCase.execute(
      payload.conversationId,
      {
        content: payload.message,
        origin: MessageOrigin.AI,
        channel: payload.channel as MessageChannel,
        metadata: payload.metadata,
      },
    );

    // Envia ao paciente via canal de saída (WhatsApp gateway consome)
    await this.chatProducer.publishToOutgoing({
      ...payload,
      origin: 'AI',
    });

    // Visibilidade em tempo real para o médico
    this.chatGateway.emitNewMessage(payload.conversationId, message);
  }
}
