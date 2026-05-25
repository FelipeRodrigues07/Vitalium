import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';
import type { DoctorSpecialization } from '../../../infrastructure/database/models/doctor-specialization.models';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class SearchDoctorSpecializationUseCase {
  constructor(
    @Inject('IDoctorSpecializationRepository')
    private readonly doctorSpecializationRepository: IDoctorSpecializationRepository,
  ) {}

  async findById(id: string): Promise<DoctorSpecialization> {
    try {
      const doctorSpecialization =
        await this.doctorSpecializationRepository.findById(id);

      if (!doctorSpecialization) {
        throw new NotFoundException(
          `Vínculo médico-especialização com ID ${id} não encontrado`,
        );
      }

      return doctorSpecialization;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao buscar vínculo médico-especialização',
        error,
      );
    }
  }

  async findByDoctorId(doctorId: string): Promise<DoctorSpecialization[]> {
    try {
      return await this.doctorSpecializationRepository.findByDoctorId(doctorId);
    } catch (error) {
      throw new DatabaseException(
        'Erro ao listar especializações do médico',
        error,
      );
    }
  }

  async findBySpecializationId(
    specializationId: string,
  ): Promise<DoctorSpecialization[]> {
    try {
      return await this.doctorSpecializationRepository.findBySpecializationId(
        specializationId,
      );
    } catch (error) {
      throw new DatabaseException(
        'Erro ao listar médicos da especialização',
        error,
      );
    }
  }
}
