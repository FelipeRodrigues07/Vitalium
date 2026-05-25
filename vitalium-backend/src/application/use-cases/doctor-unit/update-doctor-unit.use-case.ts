import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import type { DoctorUnit } from '../../../infrastructure/database/models/doctor-unit.models';
import type { UpdateDoctorUnitDTO } from '../../../presentation/dto/doctor-unitDTO/update-doctor-unit.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';

@Injectable()
export class UpdateDoctorUnitUseCase {
  constructor(
    @Inject('IDoctorUnitRepository')
    private readonly doctorUnitRepository: IDoctorUnitRepository,
  ) {}

  async execute(id: string, dto: UpdateDoctorUnitDTO): Promise<DoctorUnit> {
    const errors: FieldError[] = [];

    if (!id) {
      errors.push({
        field: 'id',
        value: id,
        constraints: ['ID é obrigatório'],
      });
    }

    if (dto.consultationPrice !== undefined && dto.consultationPrice <= 0) {
      errors.push({
        field: 'consultationPrice',
        value: dto.consultationPrice,
        constraints: ['Preço da consulta deve ser maior que zero'],
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
      return await this.doctorUnitRepository.update(id, dto);
    } catch (error) {
      throw new DatabaseException(
        'Erro ao atualizar a associação médico-unidade',
        error,
      );
    }
  }
}
