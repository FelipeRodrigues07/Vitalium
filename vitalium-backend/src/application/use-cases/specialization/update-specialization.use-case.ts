import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { Specialization } from '../../../infrastructure/database/models/specialization.models';
import type { UpdateSpecializationDTO } from '../../../presentation/dto/specializationDTO/update-specialization.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';

@Injectable()
export class UpdateSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(
    id: string,
    updateSpecializationDTO: UpdateSpecializationDTO,
  ): Promise<Specialization> {
    try {
      const existingSpecialization =
        await this.specializationRepository.findById(id);

      if (!existingSpecialization) {
        throw new NotFoundException(
          `Especialização com ID ${id} não encontrada`,
        );
      }

      if (
        updateSpecializationDTO.name &&
        updateSpecializationDTO.name !== existingSpecialization.name
      ) {
        const existingByName = await this.specializationRepository.findByName(
          updateSpecializationDTO.name,
        );

        if (existingByName) {
          throw new ValidationException([
            {
              field: 'name',
              value: updateSpecializationDTO.name,
              constraints: ['Já existe uma especialização com este nome'],
            },
          ]);
        }
      }

      return await this.specializationRepository.update(
        id,
        updateSpecializationDTO,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      throw new DatabaseException('Erro ao atualizar especialização', error);
    }
  }
}
