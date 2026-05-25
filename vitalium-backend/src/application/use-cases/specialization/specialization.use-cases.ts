import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { SpecializationNotFoundException } from '../../../shared/execeptions/specialization/specialization-not-found.exception';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { CreateSpecializationDTO } from '../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { UpdateSpecializationDTO } from '../../../presentation/dto/specializationDTO/update-specialization.dto';
import type { Specialization } from '../../../infrastructure/database/models/specialization.models';

@Injectable()
export class CreateSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly repo: ISpecializationRepository,
  ) {}
  async execute(dto: CreateSpecializationDTO): Promise<Specialization> {
    try {
      const existing = await this.repo.findByName(dto.name);
      if (existing) {
        throw new ValidationException([
          {
            field: 'name',
            value: dto.name,
            constraints: ['Já existe uma especialização com este nome'],
          },
        ]);
      }
      return await this.repo.create(dto);
    } catch (error) {
      if (error instanceof ValidationException) throw error;
      throw new DatabaseException('criar especialização', error);
    }
  }
}

@Injectable()
export class SearchSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly repo: ISpecializationRepository,
  ) {}
  async findById(id: string): Promise<Specialization> {
    try {
      const spec = await this.repo.findById(id);
      if (!spec) throw new SpecializationNotFoundException(id);
      return spec;
    } catch (error) {
      if (error instanceof SpecializationNotFoundException) throw error;
      throw new DatabaseException('buscar especialização', error);
    }
  }
  async findAll(isActive?: boolean): Promise<Specialization[]> {
    try {
      return await this.repo.findAll(
        isActive !== undefined ? { isActive } : {},
      );
    } catch (error) {
      throw new DatabaseException('listar especializações', error);
    }
  }
}

@Injectable()
export class UpdateSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly repo: ISpecializationRepository,
  ) {}
  async execute(
    id: string,
    dto: UpdateSpecializationDTO,
  ): Promise<Specialization> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new SpecializationNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof SpecializationNotFoundException) throw error;
      throw new DatabaseException('atualizar especialização', error);
    }
  }
}

@Injectable()
export class DeleteSpecializationUseCase {
  constructor(
    @Inject('ISpecializationRepository')
    private readonly repo: ISpecializationRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new SpecializationNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof SpecializationNotFoundException) throw error;
      throw new DatabaseException('excluir especialização', error);
    }
  }
}
