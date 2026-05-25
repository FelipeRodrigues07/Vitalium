import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import type { CreateMedicalRecordDTO } from '../../../presentation/dto/medicalRecordDTO/create-medical-record.dto';
import type { MedicalRecord } from '../../../infrastructure/database/models/medical-record.models';

@Injectable()
export class CreateMedicalRecordUseCase {
  constructor(
    @Inject('IMedicalRecordRepository')
    private readonly medicalRecordRepository: IMedicalRecordRepository,
  ) {}

  async execute(dto: CreateMedicalRecordDTO): Promise<MedicalRecord> {
    try {
      return await this.medicalRecordRepository.create(dto);
    } catch (error) {
      throw new DatabaseException('criar prontuário', error);
    }
  }
}
