import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { Doctor } from '../../../infrastructure/database/models/doctor.models';
import type { UpdateDoctorDTO } from '../../../presentation/dto/doctorDTO/update-doctor.dto';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';

@Injectable()
export class UpdateDoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(id: string, updateDoctorDTO: UpdateDoctorDTO): Promise<Doctor> {
    const errors: FieldError[] = [];

    if (!updateDoctorDTO.crm) {
      errors.push({
        field: 'crm',
        value: updateDoctorDTO.crm,
        constraints: ['Crm é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const updatedDoctor = await this.doctorRepository.update(
        id,
        updateDoctorDTO,
      );
      if (!updatedDoctor) {
        throw new DoctorNotFoundException(`ID: ${id}`);
      }
      return updatedDoctor;
    } catch (error) {
      if (error instanceof DoctorNotFoundException) {
        throw error;
      }
      throw new DatabaseException('atualizar médico', error);
    }
  }
}
