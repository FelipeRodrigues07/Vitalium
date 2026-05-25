import { Inject, Injectable } from '@nestjs/common';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import { MedicalRecordNotFoundException } from '../../../shared/execeptions/medical-record/medical-record-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class DeleteMedicalRecordUseCase {
  constructor(
    @Inject('IMedicalRecordRepository')
    private readonly medicalRecordRepository: IMedicalRecordRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existing = await this.medicalRecordRepository.findById(id);
      if (!existing) throw new MedicalRecordNotFoundException(id);
      await this.medicalRecordRepository.delete(id);
    } catch (error) {
      if (error instanceof MedicalRecordNotFoundException) throw error;
      throw new DatabaseException('remover prontuário', error);
    }
  }
}
