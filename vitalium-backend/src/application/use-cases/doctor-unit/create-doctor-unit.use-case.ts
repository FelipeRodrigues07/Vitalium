import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import type { DoctorUnit } from '../../../infrastructure/database/models/doctor-unit.models';
import type { CreateDoctorUnitDTO } from '../../../presentation/dto/doctor-unitDTO/create-doctor-unit.dto';
import { ConflictException } from '../../../shared/execeptions/system/conflict.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitInvalidException } from '../../../shared/execeptions/units/unit-invalid.exception';

@Injectable()
export class CreateDoctorUnitUseCase {
  constructor(
    @Inject('IDoctorUnitRepository')
    private readonly doctorUnitRepository: IDoctorUnitRepository,

    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,

    @Inject('IUnitRepository')
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(createDoctorUnitDTO: CreateDoctorUnitDTO): Promise<DoctorUnit> {
    const errors: FieldError[] = [];

    // Validate consultationPrice only if it's provided
    if (
      createDoctorUnitDTO.consultationPrice !== undefined &&
      createDoctorUnitDTO.consultationPrice <= 0
    ) {
      errors.push({
        field: 'consultationPrice',
        value: createDoctorUnitDTO.consultationPrice,
        constraints: ['Preço da consulta deve ser maior que zero'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const doctor = await this.doctorRepository.findById(
        createDoctorUnitDTO.doctorId,
      );

      if (!doctor) {
        throw new ValidationException([
          {
            field: 'doctorId',
            value: createDoctorUnitDTO.doctorId,
            constraints: ['Médico não encontrado'],
          },
        ]);
      }

      const unit = await this.unitRepository.findById(
        createDoctorUnitDTO.unitId,
      );

      if (!unit || unit.isActive === false) {
        throw new UnitInvalidException(createDoctorUnitDTO.unitId);
      }

      // Check if relationship already exists
      const existingRelationship =
        await this.doctorUnitRepository.findByDoctorIdAndUnitId(
          createDoctorUnitDTO.doctorId,
          createDoctorUnitDTO.unitId,
        );

      if (existingRelationship) {
        throw new ConflictException(
          'Relação médico-unidade já existe',
          'doctorId_unitId',
          `${createDoctorUnitDTO.doctorId}_${createDoctorUnitDTO.unitId}`,
        );
      }

      return await this.doctorUnitRepository.create(createDoctorUnitDTO);
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof UnitInvalidException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new DatabaseException('criar associação médico-unidade', error);
    }
  }
}
