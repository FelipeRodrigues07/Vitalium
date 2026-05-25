import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IMessageRepository } from '../../../domain/interfaces/repositories/chat/message.repository.interface';
import type { SendMessageDTO } from '../../../presentation/dto/chatDTO/send-message.dto';
import { MessageChannel } from '../../../shared/enums/message-channel.enum';
import type { MessageStatus } from '../../../shared/enums/message-status.enum';
import { Message } from '../../database/models/message.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(
    dto: SendMessageDTO & { conversationId: string },
  ): Promise<Message> {
    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: dto.senderId ?? null,
        content: dto.content,
        origin: dto.origin,
        channel: dto.channel ?? MessageChannel.WEB,
        metadata: (dto.metadata as object) ?? undefined,
      },
    });

    // Atualiza updatedAt da conversa para ordenação por atividade recente
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { updatedAt: new Date() },
    });

    return plainToInstance(Message, message);
  }

  async findById(id: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) return null;
    return plainToInstance(Message, message);
  }

  async findByConversation(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<{ messages: Message[]; total: number }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return { messages: plainToInstance(Message, messages), total };
  }

  async updateStatus(id: string, status: MessageStatus): Promise<Message> {
    const message = await this.prisma.message.update({
      where: { id },
      data: { status },
    });
    return plainToInstance(Message, message);
  }
}
