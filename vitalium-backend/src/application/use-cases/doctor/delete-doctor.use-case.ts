import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class DeleteDoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const doctor = await this.doctorRepository.findById(id);
      if (!doctor) {
        throw new DoctorNotFoundException(`ID: ${id}`);
      }

      await this.doctorRepository.delete(id);
    } catch (error) {
      if (error instanceof DoctorNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Erro ao deletar médico', error);
    }
  }
}
