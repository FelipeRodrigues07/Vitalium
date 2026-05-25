import { Inject, Injectable } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class DeletePatientUseCase {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      return await this.patientRepository.delete(id);
    } catch (error) {
      if (error instanceof PatientNotFoundException) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        throw new PatientNotFoundException(`ID: ${id}`);
      }
      throw new DatabaseException('deletar paciente', error);
    }
  }
}
