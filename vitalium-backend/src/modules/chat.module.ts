import { Module } from '@nestjs/common';
// Use-Cases
import { CreateConversationUseCase } from '../application/use-cases/chat/create-conversation.use-case';
import { GetConversationUseCase } from '../application/use-cases/chat/get-conversation.use-case';
import { ListConversationsUseCase } from '../application/use-cases/chat/list-conversations.use-case';
import { SendMessageUseCase } from '../application/use-cases/chat/send-message.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
// Repositories
import { ConversationRepository } from '../infrastructure/repositories/chat/conversation.repository';
import { MessageRepository } from '../infrastructure/repositories/chat/message.repository';
import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
// Controller
import { ChatController } from '../presentation/controllers/chat/chat.controller';

// Gateway
import { ChatGateway } from '../shared/gateways/chat.gateway';

// Consumers
import { WhatsappIncomingConsumer } from '../shared/messaging/consumers/whatsapp-incoming.consumer';
import { RabbitMQModule } from '../shared/messaging/rabbitmq.module';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  controllers: [ChatController],
  providers: [
    // Repository bindings
    { provide: 'IConversationRepository', useClass: ConversationRepository },
    { provide: 'IMessageRepository', useClass: MessageRepository },
    { provide: 'IPatientRepository', useClass: PatientRepository },

    // Use-Cases
    CreateConversationUseCase,
    SendMessageUseCase,
    GetConversationUseCase,
    ListConversationsUseCase,

    // WebSocket
    ChatGateway,

    // Queue consumers (auto-inicializam via OnModuleInit)
    WhatsappIncomingConsumer,
  ],
  exports: [ChatGateway, SendMessageUseCase],
})
export class ChatModule {}
