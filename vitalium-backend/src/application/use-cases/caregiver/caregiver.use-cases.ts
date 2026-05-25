import { Inject, Injectable } from '@nestjs/common';
import type { ICaregiverRepository } from '../../../domain/interfaces/repositories/caregiver/caregiver.repository.interface';
import type { Caregiver } from '../../../infrastructure/database/models/caregiver.models';
import type { CreateCaregiverDTO } from '../../../presentation/dto/caregiverDTO/create-caregiver.dto';
import type { UpdateCaregiverDTO } from '../../../presentation/dto/caregiverDTO/update-caregiver.dto';
import { CaregiverAlreadyExistsException } from '../../../shared/execeptions/caregiver/caregiver-already-exists.exception';
import { CaregiverNotFoundException } from '../../../shared/execeptions/caregiver/caregiver-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreateCaregiverUseCase {
  constructor(
    @Inject('ICaregiverRepository') private readonly repo: ICaregiverRepository,
  ) {}
  async execute(dto: CreateCaregiverDTO): Promise<Caregiver> {
    try {
      const existing = await this.repo.findByCpf(dto.cpf);
      if (existing) throw new CaregiverAlreadyExistsException(dto.cpf);
      return await this.repo.create(dto);
    } catch (error) {
      if (error instanceof CaregiverAlreadyExistsException) throw error;
      throw new DatabaseException('criar cuidador', error);
    }
  }
}

@Injectable()
export class SearchCaregiverUseCase {
  constructor(
    @Inject('ICaregiverRepository') private readonly repo: ICaregiverRepository,
  ) {}
  async findById(id: string): Promise<Caregiver> {
    try {
      const caregiver = await this.repo.findById(id);
      if (!caregiver) throw new CaregiverNotFoundException(id);
      return caregiver;
    } catch (error) {
      if (error instanceof CaregiverNotFoundException) throw error;
      throw new DatabaseException('buscar cuidador', error);
    }
  }
  async findAll(): Promise<Caregiver[]> {
    try {
      return await this.repo.findAll();
    } catch (error) {
      throw new DatabaseException('listar cuidadores', error);
    }
  }
  async findByPatientId(patientId: string): Promise<Caregiver[]> {
    try {
      return await this.repo.findByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar cuidadores do paciente', error);
    }
  }
}

@Injectable()
export class UpdateCaregiverUseCase {
  constructor(
    @Inject('ICaregiverRepository') private readonly repo: ICaregiverRepository,
  ) {}
  async execute(id: string, dto: UpdateCaregiverDTO): Promise<Caregiver> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new CaregiverNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof CaregiverNotFoundException) throw error;
      throw new DatabaseException('atualizar cuidador', error);
    }
  }
}

@Injectable()
export class DeleteCaregiverUseCase {
  constructor(
    @Inject('ICaregiverRepository') private readonly repo: ICaregiverRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new CaregiverNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof CaregiverNotFoundException) throw error;
      throw new DatabaseException('remover cuidador', error);
    }
  }
}

@Injectable()
export class LinkCaregiverUseCase {
  constructor(
    @Inject('ICaregiverRepository') private readonly repo: ICaregiverRepository,
  ) {}
  async link(caregiverId: string, patientId: string): Promise<void> {
    try {
      await this.repo.linkToPatient(caregiverId, patientId);
    } catch (error) {
      throw new DatabaseException('vincular cuidador ao paciente', error);
    }
  }
  async unlink(caregiverId: string, patientId: string): Promise<void> {
    try {
      await this.repo.unlinkFromPatient(caregiverId, patientId);
    } catch (error) {
      throw new DatabaseException('desvincular cuidador do paciente', error);
    }
  }
}
