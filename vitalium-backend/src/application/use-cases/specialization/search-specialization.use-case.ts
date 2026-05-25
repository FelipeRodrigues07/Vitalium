import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { Specialization } from '../../../infrastructure/database/models/specialization.models';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class SearchSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly specializationRepository: ISpecializationRepository,
  ) {}

  async findById(id: string): Promise<Specialization> {
    try {
      const specialization = await this.specializationRepository.findById(id);

      if (!specialization) {
        throw new NotFoundException(
          `Especialização com ID ${id} não encontrada`,
        );
      }

      return specialization;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new DatabaseException('Erro ao buscar especialização', error);
    }
  }

  async findAll(): Promise<Specialization[]> {
    try {
      return await this.specializationRepository.findAll();
    } catch (error) {
      throw new DatabaseException('Erro ao listar especializações', error);
    }
  }
}
