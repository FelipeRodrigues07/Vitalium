import { Inject, Injectable } from '@nestjs/common';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import type { Unit } from '../../../infrastructure/database/models/unit.models';
import type { UpdateUnitDTO } from '../../../presentation/dto/unitDTO/update-unit.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';

@Injectable()
export class UpdateUnitUseCase {
  constructor(
    @Inject('IUnitRepository')
    private readonly unitRepository: IUnitRepository,
  ) {}
  async execute(id: string, updateUnitDTO: UpdateUnitDTO): Promise<Unit> {
    const errors: FieldError[] = [];

    if (!id) {
      errors.push({
        field: 'id',
        value: id,
        constraints: ['ID é obrigatório'],
      });
    }
    if (!updateUnitDTO) {
      errors.push({
        field: 'updateUnitDTO',
        value: updateUnitDTO,
        constraints: ['Dados para atualização são obrigatórios'],
      });
    }

    //Validação customizada para nome com apenas espaços
    if (updateUnitDTO.name !== undefined && updateUnitDTO.name.trim() === '') {
      errors.push({
        field: 'name',
        value: updateUnitDTO.name,
        constraints: ['Nome é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new UnitNotFoundException(
        `Nenhuma unidade foi encontrada com os critérios: ID: ${id}`,
      );
    }

    try {
      const updatedUnit = await this.unitRepository.update(id, updateUnitDTO);
      return updatedUnit;
    } catch (error) {
      throw new DatabaseException('Erro ao atualizar a unidade', error);
    }
  }
}
