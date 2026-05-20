import { Inject, Injectable } from '@nestjs/common';
import {
  ValidationException,
  type FieldError,
} from '../../../shared/execeptions/system/validation.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { CreateSpecializationDTO } from '../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { Specialization } from '../../../infrastructure/database/models/specialization.models';

@Injectable()
export class CreateSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    createSpecializationDTO: CreateSpecializationDTO,
  ): Promise<Specialization> {
    const errors: FieldError[] = [];

    if (!createSpecializationDTO.name) {
      errors.push({
        field: 'name',
        value: createSpecializationDTO.name,
        constraints: ['Nome é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const existingByName = await this.specializationRepository.findByName(
        createSpecializationDTO.name,
      );

      if (existingByName) {
        throw new ValidationException([
          {
            field: 'name',
            value: createSpecializationDTO.name,
            constraints: ['Já existe uma especialização com este nome'],
          },
        ]);
      }

      return await this.specializationRepository.create(
        createSpecializationDTO,
      );
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      throw new DatabaseException('Erro ao criar especialização', error);
    }
  }
}
