import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class DeleteDoctorSpecializationUseCase {
  constructor(
    @Inject('IDoctorSpecializationRepository')
    private readonly doctorSpecializationRepository: IDoctorSpecializationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existingDoctorSpecialization =
        await this.doctorSpecializationRepository.findById(id);

      if (!existingDoctorSpecialization) {
        throw new NotFoundException(
          `Vínculo médico-especialização com ID ${id} não encontrado`,
        );
      }

      await this.doctorSpecializationRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao deletar vínculo médico-especialização',
        error,
      );
    }
  }
}
