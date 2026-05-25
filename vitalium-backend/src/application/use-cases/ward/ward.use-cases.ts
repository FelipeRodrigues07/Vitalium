import { Inject, Injectable } from '@nestjs/common';
import type { IWardRepository } from '../../../domain/interfaces/repositories/ward/ward.repository.interface';
import type { Ward } from '../../../infrastructure/database/models/ward.models';
import type { CreateWardDTO } from '../../../presentation/dto/wardDTO/create-ward.dto';
import type { UpdateWardDTO } from '../../../presentation/dto/wardDTO/update-ward.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { WardNotFoundException } from '../../../shared/execeptions/ward/ward-not-found.exception';

@Injectable()
export class CreateWardUseCase {
  constructor(
    @Inject('IWardRepository') private readonly wardRepository: IWardRepository,
  ) {}
  async execute(dto: CreateWardDTO): Promise<Ward> {
    try {
      return await this.wardRepository.create(dto);
    } catch (error) {
      throw new DatabaseException('criar ala', error);
    }
  }
}

@Injectable()
export class SearchWardUseCase {
  constructor(
    @Inject('IWardRepository') private readonly wardRepository: IWardRepository,
  ) {}
  async findById(id: string): Promise<Ward> {
    try {
      const ward = await this.wardRepository.findById(id);
      if (!ward) throw new WardNotFoundException(id);
      return ward;
    } catch (error) {
      if (error instanceof WardNotFoundException) throw error;
      throw new DatabaseException('buscar ala', error);
    }
  }
  async findByUnitId(unitId: string): Promise<Ward[]> {
    try {
      return await this.wardRepository.findByUnitId(unitId);
    } catch (error) {
      throw new DatabaseException('listar alas', error);
    }
  }
}

@Injectable()
export class UpdateWardUseCase {
  constructor(
    @Inject('IWardRepository') private readonly wardRepository: IWardRepository,
  ) {}
  async execute(id: string, dto: UpdateWardDTO): Promise<Ward> {
    try {
      const existing = await this.wardRepository.findById(id);
      if (!existing) throw new WardNotFoundException(id);
      return await this.wardRepository.update(id, dto);
    } catch (error) {
      if (error instanceof WardNotFoundException) throw error;
      throw new DatabaseException('atualizar ala', error);
    }
  }
}

@Injectable()
export class DeleteWardUseCase {
  constructor(
    @Inject('IWardRepository') private readonly wardRepository: IWardRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.wardRepository.findById(id);
      if (!existing) throw new WardNotFoundException(id);
      await this.wardRepository.delete(id);
    } catch (error) {
      if (error instanceof WardNotFoundException) throw error;
      throw new DatabaseException('remover ala', error);
    }
  }
}
