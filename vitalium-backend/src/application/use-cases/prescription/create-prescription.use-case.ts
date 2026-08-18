import { Inject, Injectable } from '@nestjs/common';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import type { Prescription } from '../../../infrastructure/database/models/prescription.models';
import type { CreatePrescriptionDTO } from '../../../presentation/dto/prescriptionDTO/create-prescription.dto';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';

@Injectable()
export class CreatePrescriptionUseCase {
  constructor(
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepository: IPrescriptionRepository,
    private readonly clinicMembershipService: ClinicMembershipService,
  ) {}

  async execute(dto: CreatePrescriptionDTO): Promise<Prescription> {
    try {
      await this.clinicMembershipService.assertDoctorAndPatientInUnit(
        dto.doctorId,
        dto.patientId,
        dto.unitId,
      );

      return await this.prescriptionRepository.create(dto);
    } catch (error) {
      if (error instanceof ValidationException) throw error;
      throw new DatabaseException('criar prescrição', error);
    }
  }
}
