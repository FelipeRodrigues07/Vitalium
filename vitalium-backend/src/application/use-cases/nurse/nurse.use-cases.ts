import { Inject, Injectable } from '@nestjs/common';
import type { INurseRepository } from '../../../domain/interfaces/repositories/nurse/nurse.repository.interface';
import type { Nurse } from '../../../infrastructure/database/models/nurse.models';
import type { CreateNurseDTO } from '../../../presentation/dto/nurseDTO/create-nurse.dto';
import type { UpdateNurseDTO } from '../../../presentation/dto/nurseDTO/update-nurse.dto';
import { NurseAlreadyExistsException } from '../../../shared/execeptions/nurse/nurse-already-exists.exception';
import { NurseNotFoundException } from '../../../shared/execeptions/nurse/nurse-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreateNurseUseCase {
  constructor(
    @Inject('INurseRepository')
    private readonly repo: INurseRepository,
  ) {}
  async execute(dto: CreateNurseDTO): Promise<Nurse> {
    try {
      const existing = await this.repo.findByCoren(dto.coren);
      if (existing) throw new NurseAlreadyExistsException(dto.coren);
      return await this.repo.create(dto);
    } catch (error) {
      if (error instanceof NurseAlreadyExistsException) throw error;
      throw new DatabaseException('criar enfermeiro(a)', error);
    }
  }
}

@Injectable()
export class SearchNurseUseCase {
  constructor(
    @Inject('INurseRepository')
    private readonly repo: INurseRepository,
  ) {}
  async findById(id: string): Promise<Nurse> {
    try {
      const nurse = await this.repo.findById(id);
      if (!nurse) throw new NurseNotFoundException(id);
      return nurse;
    } catch (error) {
      if (error instanceof NurseNotFoundException) throw error;
      throw new DatabaseException('buscar enfermeiro(a)', error);
    }
  }
  async findAll(isActive?: boolean): Promise<Nurse[]> {
    try {
      return await this.repo.findAll(
        isActive !== undefined ? { isActive } : {},
      );
    } catch (error) {
      throw new DatabaseException('listar enfermeiros(as)', error);
    }
  }
}

@Injectable()
export class UpdateNurseUseCase {
  constructor(
    @Inject('INurseRepository')
    private readonly repo: INurseRepository,
  ) {}
  async execute(id: string, dto: UpdateNurseDTO): Promise<Nurse> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NurseNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof NurseNotFoundException) throw error;
      throw new DatabaseException('atualizar enfermeiro(a)', error);
    }
  }
}

@Injectable()
export class DeleteNurseUseCase {
  constructor(
    @Inject('INurseRepository')
    private readonly repo: INurseRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NurseNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof NurseNotFoundException) throw error;
      throw new DatabaseException('excluir enfermeiro(a)', error);
    }
  }
}
