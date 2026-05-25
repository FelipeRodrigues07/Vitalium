import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationException,
  type FieldError,
} from '../../../shared/execeptions/system/validation.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { CreateDoctorSpecializationDTO } from '../../../presentation/dto/doctor-specializationDTO/create-doctor-specialization.dto';
import type { DoctorSpecialization } from '../../../infrastructure/database/models/doctor-specialization.models';

@Injectable()
export class CreateDoctorSpecializationUseCase {
  constructor(
    @Inject('IDoctorSpecializationRepository')
    private readonly doctorSpecializationRepository: IDoctorSpecializationRepository,
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
    @Inject('ISpecializationRepository')
    private readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    createDoctorSpecializationDTO: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecialization> {
    const errors: FieldError[] = [];

    if (!createDoctorSpecializationDTO.doctorId) {
      errors.push({
        field: 'doctorId',
        value: createDoctorSpecializationDTO.doctorId,
        constraints: ['ID do médico é obrigatório'],
      });
    }

    if (!createDoctorSpecializationDTO.specializationId) {
      errors.push({
        field: 'specializationId',
        value: createDoctorSpecializationDTO.specializationId,
        constraints: ['ID da especialização é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const doctor = await this.doctorRepository.findById(
        createDoctorSpecializationDTO.doctorId,
      );

      if (!doctor) {
        throw new ValidationException([
          {
            field: 'doctorId',
            value: createDoctorSpecializationDTO.doctorId,
            constraints: ['Médico não encontrado'],
          },
        ]);
      }

      const specialization = await this.specializationRepository.findById(
        createDoctorSpecializationDTO.specializationId,
      );

      if (!specialization) {
        throw new ValidationException([
          {
            field: 'specializationId',
            value: createDoctorSpecializationDTO.specializationId,
            constraints: ['Especialização não encontrada'],
          },
        ]);
      }

      const existing =
        await this.doctorSpecializationRepository.findByDoctorAndSpecialization(
          createDoctorSpecializationDTO.doctorId,
          createDoctorSpecializationDTO.specializationId,
        );

      if (existing) {
        throw new ValidationException([
          {
            field: 'doctorSpecialization',
            value: `${createDoctorSpecializationDTO.doctorId}-${createDoctorSpecializationDTO.specializationId}`,
            constraints: ['Médico já possui vínculo com esta especialização'],
          },
        ]);
      }

      return await this.doctorSpecializationRepository.create(
        createDoctorSpecializationDTO,
      );
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new DatabaseException(
        'Erro ao criar vínculo médico-especialização',
        error,
      );
    }
  }
}
