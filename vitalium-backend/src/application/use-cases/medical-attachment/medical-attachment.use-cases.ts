import { Inject, Injectable } from '@nestjs/common';
import type { IMedicalAttachmentRepository } from '../../../domain/interfaces/repositories/medical-attachment/medical-attachment.repository.interface';
import type { MedicalAttachment } from '../../../infrastructure/database/models/medical-attachment.models';
import type { CreateMedicalAttachmentDTO } from '../../../presentation/dto/medicalAttachmentDTO/create-medical-attachment.dto';
import { MedicalAttachmentNotFoundException } from '../../../shared/execeptions/medical-attachment/medical-attachment-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreateMedicalAttachmentUseCase {
  constructor(
    @Inject('IMedicalAttachmentRepository')
    private readonly repo: IMedicalAttachmentRepository,
  ) {}
  async execute(dto: CreateMedicalAttachmentDTO): Promise<MedicalAttachment> {
    try {
      return await this.repo.create(dto);
    } catch (error) {
      throw new DatabaseException('criar anexo médico', error);
    }
  }
}

@Injectable()
export class SearchMedicalAttachmentUseCase {
  constructor(
    @Inject('IMedicalAttachmentRepository')
    private readonly repo: IMedicalAttachmentRepository,
  ) {}
  async findById(id: string): Promise<MedicalAttachment> {
    try {
      const attachment = await this.repo.findById(id);
      if (!attachment) throw new MedicalAttachmentNotFoundException(id);
      return attachment;
    } catch (error) {
      if (error instanceof MedicalAttachmentNotFoundException) throw error;
      throw new DatabaseException('buscar anexo médico', error);
    }
  }
  async findByMedicalRecordId(
    medicalRecordId: string,
  ): Promise<MedicalAttachment[]> {
    try {
      return await this.repo.findByMedicalRecordId(medicalRecordId);
    } catch (error) {
      throw new DatabaseException('listar anexos do prontuário', error);
    }
  }
}

@Injectable()
export class DeleteMedicalAttachmentUseCase {
  constructor(
    @Inject('IMedicalAttachmentRepository')
    private readonly repo: IMedicalAttachmentRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new MedicalAttachmentNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof MedicalAttachmentNotFoundException) throw error;
      throw new DatabaseException('remover anexo médico', error);
    }
  }
}
