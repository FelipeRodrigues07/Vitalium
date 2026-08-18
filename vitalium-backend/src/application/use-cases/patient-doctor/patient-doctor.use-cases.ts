import { Inject, Injectable } from '@nestjs/common';
import type { IPatientDoctorRepository } from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { PatientDoctor } from '../../../infrastructure/database/models/patient-doctor.models';
import type { UpdatePatientDoctorDTO } from '../../../presentation/dto/patientDoctorDTO/update-patient-doctor.dto';
import { PatientDoctorNotFoundException } from '../../../shared/execeptions/patient-doctor/patient-doctor-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class SearchPatientDoctorUseCase {
  constructor(
    @Inject('IPatientDoctorRepository')
    private readonly repo: IPatientDoctorRepository,
  ) {}
  async findById(id: string): Promise<PatientDoctor> {
    try {
      const link = await this.repo.findById(id);
      if (!link) throw new PatientDoctorNotFoundException(id);
      return link;
    } catch (error) {
      if (error instanceof PatientDoctorNotFoundException) throw error;
      throw new DatabaseException('buscar vínculo paciente-médico', error);
    }
  }
  async findByPatientId(patientId: string): Promise<PatientDoctor[]> {
    try {
      return await this.repo.findByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar médicos do paciente', error);
    }
  }
  async findActiveByPatientId(patientId: string): Promise<PatientDoctor[]> {
    try {
      return await this.repo.findActiveByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar médicos ativos do paciente', error);
    }
  }
  async findByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<PatientDoctor[]> {
    try {
      return await this.repo.findByDoctorId(doctorId, unitId);
    } catch (error) {
      throw new DatabaseException('listar pacientes do médico', error);
    }
  }
}

@Injectable()
export class UpdatePatientDoctorUseCase {
  constructor(
    @Inject('IPatientDoctorRepository')
    private readonly repo: IPatientDoctorRepository,
  ) {}
  async execute(
    id: string,
    dto: UpdatePatientDoctorDTO,
  ): Promise<PatientDoctor> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new PatientDoctorNotFoundException(id);
      return await this.repo.update(id, dto);
    } catch (error) {
      if (error instanceof PatientDoctorNotFoundException) throw error;
      throw new DatabaseException('atualizar vínculo paciente-médico', error);
    }
  }
}

@Injectable()
export class DeletePatientDoctorUseCase {
  constructor(
    @Inject('IPatientDoctorRepository')
    private readonly repo: IPatientDoctorRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new PatientDoctorNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof PatientDoctorNotFoundException) throw error;
      throw new DatabaseException('remover vínculo paciente-médico', error);
    }
  }
}
