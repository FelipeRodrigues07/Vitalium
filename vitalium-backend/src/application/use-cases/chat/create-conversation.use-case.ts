import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { IConversationRepository } from '../../../domain/interfaces/repositories/chat/conversation.repository.interface';
import type { Conversation } from '../../../infrastructure/database/models/conversation.models';
import type { CreateConversationDTO } from '../../../presentation/dto/chatDTO/create-conversation.dto';

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject('IConversationRepository')
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(dto: CreateConversationDTO): Promise<Conversation> {
    const existing = await this.conversationRepository.findByPatientAndDoctor(
      dto.patientId,
      dto.doctorId,
    );

    if (existing) {
      throw new ConflictException(
        'Já existe uma conversa entre este paciente e médico',
      );
    }

    return this.conversationRepository.create(dto);
  }
}
