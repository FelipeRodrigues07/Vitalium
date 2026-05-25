import { Module } from '@nestjs/common';
import { ChatProducer } from './producers/chat.producer';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  providers: [RabbitMQService, ChatProducer],
  exports: [RabbitMQService, ChatProducer],
})
export class RabbitMQModule {}
