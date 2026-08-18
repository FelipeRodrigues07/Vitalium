import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { Doctor } from '../../../infrastructure/database/models/doctor.models';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';

@Injectable()
export class SearchDoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly DoctorRepository: IDoctorRepository,
  ) {}

  async findById(id: string): Promise<Doctor> {
    if (!id) {
      throw new ValidationException([
        {
          field: 'id',
          value: id,
          constraints: ['ID é obrigatório'],
        },
      ]);
    }

    const doctor = await this.DoctorRepository.findById(id);

    if (!doctor) {
      throw new DoctorNotFoundException(`ID: ${id}`);
    }

    return doctor;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    if (!userId) {
      throw new ValidationException([
        {
          field: 'userId',
          value: userId,
          constraints: ['ID do usuário é obrigatório'],
        },
      ]);
    }

    const doctor = await this.DoctorRepository.findByUserId(userId);

    if (!doctor || !doctor.isActive) {
      throw new DoctorNotFoundException(`userId: ${userId}`);
    }

    return doctor;
  }

  async findAll(unitId?: string): Promise<Doctor[]> {
    const doctors = unitId
      ? await this.DoctorRepository.findAllByUnitId(unitId)
      : await this.DoctorRepository.findAll();

    return doctors ?? [];
  }
}
