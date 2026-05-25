import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IConversationRepository } from '../../../domain/interfaces/repositories/chat/conversation.repository.interface';
import type { IMessageRepository } from '../../../domain/interfaces/repositories/chat/message.repository.interface';
import type { Message } from '../../../infrastructure/database/models/message.models';
import type { SendMessageDTO } from '../../../presentation/dto/chatDTO/send-message.dto';
import { MessageChannel } from '../../../shared/enums/message-channel.enum';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    @Inject('IMessageRepository')
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    conversationId: string,
    dto: SendMessageDTO,
    senderId?: string,
  ): Promise<Message> {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    return this.messageRepository.create({
      ...dto,
      conversationId,
      senderId: senderId ?? dto.senderId ?? null,
      channel: dto.channel ?? MessageChannel.WEB,
    });
  }
}
