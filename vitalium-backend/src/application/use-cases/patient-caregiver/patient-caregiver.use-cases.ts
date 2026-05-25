import { Inject, Injectable } from '@nestjs/common';
import type { IPatientCaregiverRepository } from '../../../domain/interfaces/repositories/patient-caregiver/patient-caregiver.repository.interface';
import type { PatientCaregiver } from '../../../infrastructure/database/models/patient-caregiver.models';
import type { CreatePatientCaregiverDTO } from '../../../presentation/dto/patientCaregiverDTO/create-patient-caregiver.dto';
import { PatientCaregiverNotFoundException } from '../../../shared/execeptions/patient-caregiver/patient-caregiver-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreatePatientCaregiverUseCase {
  constructor(
    @Inject('IPatientCaregiverRepository')
    private readonly repo: IPatientCaregiverRepository,
  ) {}
  async execute(dto: CreatePatientCaregiverDTO): Promise<PatientCaregiver> {
    try {
      return await this.repo.create(dto);
    } catch (error) {
      throw new DatabaseException('criar vínculo paciente-cuidador', error);
    }
  }
}

@Injectable()
export class SearchPatientCaregiverUseCase {
  constructor(
    @Inject('IPatientCaregiverRepository')
    private readonly repo: IPatientCaregiverRepository,
  ) {}
  async findById(id: string): Promise<PatientCaregiver> {
    try {
      const link = await this.repo.findById(id);
      if (!link) throw new PatientCaregiverNotFoundException(id);
      return link;
    } catch (error) {
      if (error instanceof PatientCaregiverNotFoundException) throw error;
      throw new DatabaseException('buscar vínculo paciente-cuidador', error);
    }
  }
  async findByPatientId(patientId: string): Promise<PatientCaregiver[]> {
    try {
      return await this.repo.findByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar cuidadores do paciente', error);
    }
  }
  async findByCaregiverId(caregiverId: string): Promise<PatientCaregiver[]> {
    try {
      return await this.repo.findByCaregiverId(caregiverId);
    } catch (error) {
      throw new DatabaseException('listar pacientes do cuidador', error);
    }
  }
}

@Injectable()
export class DeactivatePatientCaregiverUseCase {
  constructor(
    @Inject('IPatientCaregiverRepository')
    private readonly repo: IPatientCaregiverRepository,
  ) {}
  async execute(id: string): Promise<PatientCaregiver> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new PatientCaregiverNotFoundException(id);
      return await this.repo.deactivate(id);
    } catch (error) {
      if (error instanceof PatientCaregiverNotFoundException) throw error;
      throw new DatabaseException('desativar vínculo paciente-cuidador', error);
    }
  }
}

@Injectable()
export class DeletePatientCaregiverUseCase {
  constructor(
    @Inject('IPatientCaregiverRepository')
    private readonly repo: IPatientCaregiverRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new PatientCaregiverNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof PatientCaregiverNotFoundException) throw error;
      throw new DatabaseException('remover vínculo paciente-cuidador', error);
    }
  }
}
