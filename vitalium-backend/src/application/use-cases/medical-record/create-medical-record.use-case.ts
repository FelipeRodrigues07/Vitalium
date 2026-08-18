import { Inject, Injectable } from '@nestjs/common';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import type { MedicalRecord } from '../../../infrastructure/database/models/medical-record.models';
import type { CreateMedicalRecordDTO } from '../../../presentation/dto/medicalRecordDTO/create-medical-record.dto';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';

@Injectable()
export class CreateMedicalRecordUseCase {
  constructor(
    @Inject('IMedicalRecordRepository')
    private readonly medicalRecordRepository: IMedicalRecordRepository,
    private readonly clinicMembershipService: ClinicMembershipService,
  ) {}

  async execute(dto: CreateMedicalRecordDTO): Promise<MedicalRecord> {
    try {
      await this.clinicMembershipService.assertDoctorAndPatientInUnit(
        dto.doctorId,
        dto.patientId,
        dto.unitId,
      );

      return await this.medicalRecordRepository.create(dto);
    } catch (error) {
      if (error instanceof ValidationException) throw error;
      throw new DatabaseException('criar prontuário', error);
    }
  }
}
