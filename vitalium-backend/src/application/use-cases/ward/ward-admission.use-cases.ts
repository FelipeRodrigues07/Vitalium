import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { WardAdmissionNotFoundException } from '../../../shared/execeptions/ward/ward-admission-not-found.exception';
import type { IWardAdmissionRepository } from '../../../domain/interfaces/repositories/ward/ward-admission.repository.interface';
import type { CreateWardAdmissionDTO } from '../../../presentation/dto/wardAdmissionDTO/create-ward-admission.dto';
import type { UpdateWardAdmissionDTO } from '../../../presentation/dto/wardAdmissionDTO/update-ward-admission.dto';
import type { WardAdmission } from '../../../infrastructure/database/models/ward-admission.models';

@Injectable()
export class CreateWardAdmissionUseCase {
  constructor(
    @Inject('IWardAdmissionRepository')
    private readonly repo: IWardAdmissionRepository,
  ) {}
  async execute(dto: CreateWardAdmissionDTO): Promise<WardAdmission> {
    try {
      return await this.repo.create(dto);
    } catch (error) {
      throw new DatabaseException('criar internação', error);
    }
  }
}

@Injectable()
export class SearchWardAdmissionUseCase {
  constructor(
    @Inject('IWardAdmissionRepository')
    private readonly repo: IWardAdmissionRepository,
  ) {}
  async findById(id: string): Promise<WardAdmission> {
    try {
      const admission = await this.repo.findById(id);
      if (!admission) throw new WardAdmissionNotFoundException(id);
      return admission;
    } catch (error) {
      if (error instanceof WardAdmissionNotFoundException) throw error;
      throw new DatabaseException('buscar internação', error);
    }
  }
  async findByPatientId(patientId: string): Promise<WardAdmission[]> {
    try {
      return await this.repo.findByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar internações do paciente', error);
    }
  }
  async findByWardId(wardId: string): Promise<WardAdmission[]> {
    try {
      return await this.repo.findByWardId(wardId);
    } catch (error) {
      throw new DatabaseException('listar internações da ala', error);
    }
  }
}

@Injectable()
export class UpdateWardAdmissionUseCase {
  constructor(
    @Inject('IWardAdmissionRepository')
    private readonly repo: IWardAdmissionRepository,
  ) {}
  async execute(
    id: string,
    dto: UpdateWardAdmissionDTO,
  ): Promise<WardAdmission> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new WardAdmissionNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof WardAdmissionNotFoundException) throw error;
      throw new DatabaseException('atualizar internação', error);
    }
  }
}

@Injectable()
export class DeleteWardAdmissionUseCase {
  constructor(
    @Inject('IWardAdmissionRepository')
    private readonly repo: IWardAdmissionRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new WardAdmissionNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof WardAdmissionNotFoundException) throw error;
      throw new DatabaseException('remover internação', error);
    }
  }
}
