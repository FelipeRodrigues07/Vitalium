import { Inject, Injectable } from '@nestjs/common';
import type { ISecretaryRepository } from '../../../domain/interfaces/repositories/secretary/secretary.repository.interface';
import type { Secretary } from '../../../infrastructure/database/models/secretary.models';
import type { CreateSecretaryDTO } from '../../../presentation/dto/secretaryDTO/create-secretary.dto';
import type { UpdateSecretaryDTO } from '../../../presentation/dto/secretaryDTO/update-secretary.dto';
import { SecretaryAlreadyExistsException } from '../../../shared/execeptions/secretary/secretary-already-exists.exception';
import { SecretaryNotFoundException } from '../../../shared/execeptions/secretary/secretary-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreateSecretaryUseCase {
  constructor(
    @Inject('ISecretaryRepository')
    private readonly repo: ISecretaryRepository,
  ) {}

  async execute(dto: CreateSecretaryDTO): Promise<Secretary> {
    try {
      const existing = await this.repo.findByUserId(dto.userId);
      if (existing) throw new SecretaryAlreadyExistsException(dto.userId);
      return await this.repo.create(dto);
    } catch (error) {
      if (error instanceof SecretaryAlreadyExistsException) throw error;
      throw new DatabaseException('criar secretária(o)', error);
    }
  }
}

@Injectable()
export class SearchSecretaryUseCase {
  constructor(
    @Inject('ISecretaryRepository')
    private readonly repo: ISecretaryRepository,
  ) {}

  async findById(id: string): Promise<Secretary> {
    try {
      const secretary = await this.repo.findById(id);
      if (!secretary) throw new SecretaryNotFoundException(id);
      return secretary;
    } catch (error) {
      if (error instanceof SecretaryNotFoundException) throw error;
      throw new DatabaseException('buscar secretária(o)', error);
    }
  }

  async findByUserId(userId: string): Promise<Secretary> {
    try {
      const secretary = await this.repo.findByUserId(userId);
      if (!secretary || !secretary.isActive) {
        throw new SecretaryNotFoundException(`userId: ${userId}`);
      }
      return secretary;
    } catch (error) {
      if (error instanceof SecretaryNotFoundException) throw error;
      throw new DatabaseException('buscar secretária(o)', error);
    }
  }

  async findAll(isActive?: boolean): Promise<Secretary[]> {
    try {
      return await this.repo.findAll(
        isActive !== undefined ? { isActive } : {},
      );
    } catch (error) {
      throw new DatabaseException('listar secretárias(os)', error);
    }
  }
}

@Injectable()
export class UpdateSecretaryUseCase {
  constructor(
    @Inject('ISecretaryRepository')
    private readonly repo: ISecretaryRepository,
  ) {}

  async execute(id: string, dto: UpdateSecretaryDTO): Promise<Secretary> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new SecretaryNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof SecretaryNotFoundException) throw error;
      throw new DatabaseException('atualizar secretária(o)', error);
    }
  }
}

@Injectable()
export class DeleteSecretaryUseCase {
  constructor(
    @Inject('ISecretaryRepository')
    private readonly repo: ISecretaryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new SecretaryNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof SecretaryNotFoundException) throw error;
      throw new DatabaseException('excluir secretária(o)', error);
    }
  }
}
