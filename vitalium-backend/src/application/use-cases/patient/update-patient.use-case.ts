import { Inject, Injectable } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { Patient } from '../../../infrastructure/database/models/patient.models';
import type { UpdatePatientDTO } from '../../../presentation/dto/patientDTO/update-patient.dto';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class UpdatePatientUseCase {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(
    id: string,
    updatePatientDTO: UpdatePatientDTO,
  ): Promise<Patient> {
    try {
      const updated = await this.patientRepository.update(id, updatePatientDTO);
      if (!updated) {
        throw new PatientNotFoundException(`ID: ${id}`);
      }
      return updated;
    } catch (error) {
      if (error instanceof PatientNotFoundException) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        throw new PatientNotFoundException(`ID: ${id}`);
      }
      throw new DatabaseException('atualizar paciente', error);
    }
  }
}
