import { Inject, Injectable } from '@nestjs/common';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import { Unit } from '../../../infrastructure/database/models/unit.models';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';

@Injectable()
export class SearchUnitUseCase {
  constructor(
    @Inject('IUnitRepository')
    private readonly unitRepository: IUnitRepository,
  ) {}
  async execute(id: string): Promise<Unit> {
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

    try {
      const unit = await this.unitRepository.findById(id);

      if (!unit) {
        throw new UnitNotFoundException(
          `Nenhum unit foi encontrado com os critérios: ID: ${id}`,
        );
      }

      return unit;
    } catch (error) {
      if (error instanceof UnitNotFoundException) {
        throw error;
      }
      throw new DatabaseException('Erro ao buscar o unit', error);
    }
  }
}
