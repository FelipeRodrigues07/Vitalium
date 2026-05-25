import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';

@Injectable()
export class DeleteDoctorUnitUseCase {
  constructor(
    @Inject('IDoctorUnitRepository')
    private readonly doctorUnitRepository: IDoctorUnitRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const errors: FieldError[] = [];

    if (!id) {
      errors.push({
        field: 'id',
        value: id,
        constraints: ['ID é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    const existing = await this.doctorUnitRepository.findById(id);
    if (!existing) {
      throw new UnitNotFoundException(`ID: ${id}`);
    }

    try {
      await this.doctorUnitRepository.delete(id);
    } catch (error) {
      throw new DatabaseException(
        'Erro ao desvincular o médico da unidade',
        error,
      );
    }
  }
}
