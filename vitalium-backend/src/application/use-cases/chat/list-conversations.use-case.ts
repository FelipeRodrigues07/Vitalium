import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IConversationRepository } from '../../../domain/interfaces/repositories/chat/conversation.repository.interface';
import type { Conversation } from '../../../infrastructure/database/models/conversation.models';
import { ConversationStatus } from '../../../shared/enums/conversation-status.enum';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';

@Injectable()
export class ListConversationsUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
    private readonly prisma: PrismaProvider,
  ) {}

  async byDoctor(
    userId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> {
    const doctor = await this.prisma.doctor.findFirst({ where: { userId } });
    if (!doctor)
      throw new NotFoundException('Médico não encontrado para este usuário');
    return this.conversationRepository.findAllByDoctor(doctor.id, status);
  }

  async byPatient(
    userId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> {
    const patient = await this.prisma.patient.findFirst({ where: { userId } });
    if (!patient)
      throw new NotFoundException('Paciente não encontrado para este usuário');
    return this.conversationRepository.findAllByPatient(patient.id, status);
  }
}
