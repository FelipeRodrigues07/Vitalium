import { Inject, Injectable } from '@nestjs/common';
import type { ISecretaryUnitRepository } from '../../../domain/interfaces/repositories/secretary/secretary-unit.repository.interface';
import type { SecretaryUnit } from '../../../infrastructure/database/models/secretary-unit.models';
import type { CreateSecretaryUnitDTO } from '../../../presentation/dto/secretaryUnitDTO/create-secretary-unit.dto';
import type { UpdateSecretaryUnitDTO } from '../../../presentation/dto/secretaryUnitDTO/update-secretary-unit.dto';
import { SecretaryUnitNotFoundException } from '../../../shared/execeptions/secretary/secretary-unit-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreateSecretaryUnitUseCase {
  constructor(
    @Inject('ISecretaryUnitRepository')
    private readonly repo: ISecretaryUnitRepository,
  ) {}

  async execute(dto: CreateSecretaryUnitDTO): Promise<SecretaryUnit> {
    try {
      return await this.repo.create(dto);
    } catch (error) {
      throw new DatabaseException('criar vínculo secretária(o)-unidade', error);
    }
  }
}

@Injectable()
export class SearchSecretaryUnitUseCase {
  constructor(
    @Inject('ISecretaryUnitRepository')
    private readonly repo: ISecretaryUnitRepository,
  ) {}

  async findById(id: string): Promise<SecretaryUnit> {
    try {
      const link = await this.repo.findById(id);
      if (!link) throw new SecretaryUnitNotFoundException(id);
      return link;
    } catch (error) {
      if (error instanceof SecretaryUnitNotFoundException) throw error;
      throw new DatabaseException(
        'buscar vínculo secretária(o)-unidade',
        error,
      );
    }
  }

  async findBySecretaryId(secretaryId: string): Promise<SecretaryUnit[]> {
    try {
      return await this.repo.findBySecretaryId(secretaryId);
    } catch (error) {
      throw new DatabaseException('listar unidades da secretária(o)', error);
    }
  }

  async findByUnitId(unitId: string): Promise<SecretaryUnit[]> {
    try {
      return await this.repo.findByUnitId(unitId);
    } catch (error) {
      throw new DatabaseException('listar secretárias(os) da unidade', error);
    }
  }
}

@Injectable()
export class UpdateSecretaryUnitUseCase {
  constructor(
    @Inject('ISecretaryUnitRepository')
    private readonly repo: ISecretaryUnitRepository,
  ) {}

  async execute(id: string, dto: UpdateSecretaryUnitDTO): Promise<SecretaryUnit> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new SecretaryUnitNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof SecretaryUnitNotFoundException) throw error;
      throw new DatabaseException(
        'atualizar vínculo secretária(o)-unidade',
        error,
      );
    }
  }
}

@Injectable()
export class DeleteSecretaryUnitUseCase {
  constructor(
    @Inject('ISecretaryUnitRepository')
    private readonly repo: ISecretaryUnitRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new SecretaryUnitNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof SecretaryUnitNotFoundException) throw error;
      throw new DatabaseException(
        'excluir vínculo secretária(o)-unidade',
        error,
      );
    }
  }
}
