import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IConversationRepository } from '../../../domain/interfaces/repositories/chat/conversation.repository.interface';
import type { CreateConversationDTO } from '../../../presentation/dto/chatDTO/create-conversation.dto';
import type { ConversationStatus } from '../../../shared/enums/conversation-status.enum';
import { Conversation } from '../../database/models/conversation.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateConversationDTO): Promise<Conversation> {
    const conversation = await this.prisma.conversation.create({
      data: {
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        channel: dto.channel,
      },
    });
    return plainToInstance(Conversation, conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    });
    if (!conversation) return null;
    return plainToInstance(Conversation, conversation);
  }

  async findByPatientAndDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<Conversation | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { patientId_doctorId: { patientId, doctorId } },
    });
    if (!conversation) return null;
    return plainToInstance(Conversation, conversation);
  }

  async findAllByDoctor(
    doctorId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { doctorId, ...(status && { status }) },
      orderBy: { updatedAt: 'desc' },
    });
    return plainToInstance(Conversation, conversations);
  }

  async findAllByPatient(
    patientId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> {
    const conversations = await this.prisma.conversation.findMany({
      where: { patientId, ...(status && { status }) },
      orderBy: { updatedAt: 'desc' },
    });
    return plainToInstance(Conversation, conversations);
  }

  async updateStatus(
    id: string,
    status: ConversationStatus,
  ): Promise<Conversation> {
    const conversation = await this.prisma.conversation.update({
      where: { id },
      data: { status },
    });
    return plainToInstance(Conversation, conversation);
  }
}
