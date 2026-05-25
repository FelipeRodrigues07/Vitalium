import {
  Injectable,
  Logger,
  type OnModuleInit,
  type OnModuleDestroy,
} from '@nestjs/common';
import * as amqplib from 'amqplib';

export const QUEUES = {
  WHATSAPP_INCOMING: 'whatsapp.incoming',
  CHAT_TO_AI: 'chat.to_ai',
  CHAT_FROM_AI: 'chat.from_ai',
  CHAT_OUTGOING: 'chat.outgoing',
} as const;

const DLQ_EXCHANGE = 'dlq.exchange';

/**
 * Serviço central de conexão com RabbitMQ.
 * Gerencia ciclo de vida da conexão, declaração de filas e DLQs.
 */
@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqplib.ChannelModel | null = null;
  private channel: amqplib.Channel | null = null;

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';

    try {
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();

      await this.channel.prefetch(1);
      await this.setupQueues();

      this.logger.log('Conectado ao RabbitMQ');
    } catch (error) {
      this.logger.error('Falha ao conectar ao RabbitMQ', error);
    }
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) return;

    // DLQ exchange
    await this.channel.assertExchange(DLQ_EXCHANGE, 'direct', {
      durable: true,
    });

    for (const queue of Object.values(QUEUES)) {
      const dlqName = `${queue}.dlq`;

      // Dead-letter queue
      await this.channel.assertQueue(dlqName, { durable: true });
      await this.channel.bindQueue(dlqName, DLQ_EXCHANGE, queue);

      // Fila principal com dead-letter routing
      await this.channel.assertQueue(queue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': DLQ_EXCHANGE,
          'x-dead-letter-routing-key': queue,
        },
      });
    }
  }

  async publish(queue: string, payload: unknown): Promise<void> {
    if (!this.channel) {
      this.logger.warn(`RabbitMQ indisponível — mensagem descartada: ${queue}`);
      return;
    }

    const content = Buffer.from(JSON.stringify(payload));
    this.channel.sendToQueue(queue, content, {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async consume(
    queue: string,
    handler: (payload: unknown) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn(
        `RabbitMQ indisponível — consumer não registrado: ${queue}`,
      );
      return;
    }

    const channel = this.channel;
    await channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString()) as unknown;
        await handler(payload);
        channel.ack(msg);
      } catch (error) {
        this.logger.error(`Erro ao processar mensagem de ${queue}`, error);
        // Rejeita sem re-enfileirar (vai para DLQ)
        channel.nack(msg, false, false);
      }
    });
  }

  private async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await (this.connection as amqplib.ChannelModel | null)?.close();
    } catch {
      // Ignora erros ao fechar
    }
  }
}
