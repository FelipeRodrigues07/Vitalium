import { Injectable, Logger } from '@nestjs/common';
import type { MessagePayloadDTO } from '../../../presentation/dto/chatDTO/message-payload.dto';
import { QUEUES, RabbitMQService } from '../rabbitmq.service';

/**
 * Producer responsável por publicar mensagens de chat nas filas do RabbitMQ.
 * Utilizado pelo Core Backend para:
 *   - chat.outgoing: enviar resposta ao paciente (via WhatsApp gateway)
 *   - chat.to_ai: encaminhar mensagem para processamento pela IA
 */
@Injectable()
export class ChatProducer {
  private readonly logger = new Logger(ChatProducer.name);

  constructor(private readonly rabbitmq: RabbitMQService) {}

  async publishToOutgoing(payload: MessagePayloadDTO): Promise<void> {
    this.logger.debug(
      `Publicando em ${QUEUES.CHAT_OUTGOING}: ${payload.conversationId}`,
    );
    await this.rabbitmq.publish(QUEUES.CHAT_OUTGOING, payload);
  }

  async publishToAI(payload: MessagePayloadDTO): Promise<void> {
    this.logger.debug(
      `Publicando em ${QUEUES.CHAT_TO_AI}: ${payload.conversationId}`,
    );
    await this.rabbitmq.publish(QUEUES.CHAT_TO_AI, payload);
  }
}
