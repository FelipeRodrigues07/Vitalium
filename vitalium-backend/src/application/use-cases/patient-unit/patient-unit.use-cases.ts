import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { PatientUnitNotFoundException } from '../../../shared/execeptions/patient-unit/patient-unit-not-found.exception';
import type { IPatientUnitRepository } from '../../../domain/interfaces/repositories/patient-unit/patient-unit.repository.interface';
import type { CreatePatientUnitDTO } from '../../../presentation/dto/patientUnitDTO/create-patient-unit.dto';
import type { UpdatePatientUnitDTO } from '../../../presentation/dto/patientUnitDTO/update-patient-unit.dto';
import type { PatientUnit } from '../../../infrastructure/database/models/patient-unit.models';

@Injectable()
export class CreatePatientUnitUseCase {
  constructor(
    @Inject('IPatientUnitRepository')
    private readonly repo: IPatientUnitRepository,
  ) {}
  async execute(dto: CreatePatientUnitDTO): Promise<PatientUnit> {
    try {
      return await this.repo.create(dto);
    } catch (error) {
      throw new DatabaseException('criar vínculo paciente-unidade', error);
    }
  }
}

@Injectable()
export class SearchPatientUnitUseCase {
  constructor(
    @Inject('IPatientUnitRepository')
    private readonly repo: IPatientUnitRepository,
  ) {}
  async findById(id: string): Promise<PatientUnit> {
    try {
      const link = await this.repo.findById(id);
      if (!link) throw new PatientUnitNotFoundException(id);
      return link;
    } catch (error) {
      if (error instanceof PatientUnitNotFoundException) throw error;
      throw new DatabaseException('buscar vínculo paciente-unidade', error);
    }
  }
  async findByPatientId(patientId: string): Promise<PatientUnit[]> {
    try {
      return await this.repo.findByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar unidades do paciente', error);
    }
  }
  async findByUnitId(unitId: string): Promise<PatientUnit[]> {
    try {
      return await this.repo.findByUnitId(unitId);
    } catch (error) {
      throw new DatabaseException('listar pacientes da unidade', error);
    }
  }
}

@Injectable()
export class UpdatePatientUnitUseCase {
  constructor(
    @Inject('IPatientUnitRepository')
    private readonly repo: IPatientUnitRepository,
  ) {}
  async execute(id: string, dto: UpdatePatientUnitDTO): Promise<PatientUnit> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new PatientUnitNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof PatientUnitNotFoundException) throw error;
      throw new DatabaseException('atualizar vínculo paciente-unidade', error);
    }
  }
}

@Injectable()
export class DeletePatientUnitUseCase {
  constructor(
    @Inject('IPatientUnitRepository')
    private readonly repo: IPatientUnitRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new PatientUnitNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof PatientUnitNotFoundException) throw error;
      throw new DatabaseException('remover vínculo paciente-unidade', error);
    }
  }
}
