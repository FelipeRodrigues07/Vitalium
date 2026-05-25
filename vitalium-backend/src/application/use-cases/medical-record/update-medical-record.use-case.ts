import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { MedicalRecordNotFoundException } from '../../../shared/execeptions/medical-record/medical-record-not-found.exception';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import type { UpdateMedicalRecordDTO } from '../../../presentation/dto/medicalRecordDTO/update-medical-record.dto';
import type { MedicalRecord } from '../../../infrastructure/database/models/medical-record.models';

@Injectable()
export class UpdateMedicalRecordUseCase {
  constructor(
    @Inject('IMedicalRecordRepository')
    private readonly medicalRecordRepository: IMedicalRecordRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdateMedicalRecordDTO,
  ): Promise<MedicalRecord> {
    try {
      const existing = await this.medicalRecordRepository.findById(id);
      if (!existing) throw new MedicalRecordNotFoundException(id);
      return await this.medicalRecordRepository.update(id, dto);
    } catch (error) {
      if (error instanceof MedicalRecordNotFoundException) throw error;
      throw new DatabaseException('atualizar prontuário', error);
    }
  }
}
