import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class DeleteSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly specializationRepository: ISpecializationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existingSpecialization =
        await this.specializationRepository.findById(id);

      if (!existingSpecialization) {
        throw new NotFoundException(
          `Especialização com ID ${id} não encontrada`,
        );
      }

      await this.specializationRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException('Erro ao deletar especialização', error);
    }
  }
}
