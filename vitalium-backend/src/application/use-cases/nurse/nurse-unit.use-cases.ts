import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { NurseUnitNotFoundException } from '../../../shared/execeptions/nurse/nurse-unit-not-found.exception';
import type { INurseUnitRepository } from '../../../domain/interfaces/repositories/nurse/nurse-unit.repository.interface';
import type { CreateNurseUnitDTO } from '../../../presentation/dto/nurseUnitDTO/create-nurse-unit.dto';
import type { UpdateNurseUnitDTO } from '../../../presentation/dto/nurseUnitDTO/update-nurse-unit.dto';
import type { NurseUnit } from '../../../infrastructure/database/models/nouse-unit.models';

@Injectable()
export class CreateNurseUnitUseCase {
  constructor(
    @Inject('INurseUnitRepository')
    private readonly repo: INurseUnitRepository,
  ) {}
  async execute(dto: CreateNurseUnitDTO): Promise<NurseUnit> {
    try {
      return await this.repo.create(dto);
    } catch (error) {
      throw new DatabaseException('criar vínculo enfermeiro(a)-unidade', error);
    }
  }
}

@Injectable()
export class SearchNurseUnitUseCase {
  constructor(
    @Inject('INurseUnitRepository')
    private readonly repo: INurseUnitRepository,
  ) {}
  async findById(id: string): Promise<NurseUnit> {
    try {
      const link = await this.repo.findById(id);
      if (!link) throw new NurseUnitNotFoundException(id);
      return link;
    } catch (error) {
      if (error instanceof NurseUnitNotFoundException) throw error;
      throw new DatabaseException(
        'buscar vínculo enfermeiro(a)-unidade',
        error,
      );
    }
  }
  async findByNurseId(nurseId: string): Promise<NurseUnit[]> {
    try {
      return await this.repo.findByNurseId(nurseId);
    } catch (error) {
      throw new DatabaseException('listar unidades da enfermeiro(a)', error);
    }
  }
  async findByUnitId(unitId: string): Promise<NurseUnit[]> {
    try {
      return await this.repo.findByUnitId(unitId);
    } catch (error) {
      throw new DatabaseException('listar enfermeiros(as) da unidade', error);
    }
  }
}

@Injectable()
export class UpdateNurseUnitUseCase {
  constructor(
    @Inject('INurseUnitRepository')
    private readonly repo: INurseUnitRepository,
  ) {}
  async execute(id: string, dto: UpdateNurseUnitDTO): Promise<NurseUnit> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NurseUnitNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof NurseUnitNotFoundException) throw error;
      throw new DatabaseException(
        'atualizar vínculo enfermeiro(a)-unidade',
        error,
      );
    }
  }
}

@Injectable()
export class DeleteNurseUnitUseCase {
  constructor(
    @Inject('INurseUnitRepository')
    private readonly repo: INurseUnitRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NurseUnitNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof NurseUnitNotFoundException) throw error;
      throw new DatabaseException(
        'excluir vínculo enfermeiro(a)-unidade',
        error,
      );
    }
  }
}
