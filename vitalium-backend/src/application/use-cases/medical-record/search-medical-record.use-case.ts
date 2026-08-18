import { Inject, Injectable } from '@nestjs/common';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import type { MedicalRecord } from '../../../infrastructure/database/models/medical-record.models';
import { MedicalRecordNotFoundException } from '../../../shared/execeptions/medical-record/medical-record-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class SearchMedicalRecordUseCase {
  constructor(
    @Inject('IMedicalRecordRepository')
    private readonly medicalRecordRepository: IMedicalRecordRepository,
  ) {}

  async findById(id: string): Promise<MedicalRecord> {
    try {
      const record = await this.medicalRecordRepository.findById(id);
      if (!record) throw new MedicalRecordNotFoundException(id);
      return record;
    } catch (error) {
      if (error instanceof MedicalRecordNotFoundException) throw error;
      throw new DatabaseException('buscar prontuário', error);
    }
  }

  async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<MedicalRecord[]> {
    try {
      return await this.medicalRecordRepository.findByPatientId(
        patientId,
        unitId,
      );
    } catch (error) {
      throw new DatabaseException('listar prontuários do paciente', error);
    }
  }

  async findByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<MedicalRecord[]> {
    try {
      return await this.medicalRecordRepository.findByDoctorId(
        doctorId,
        unitId,
      );
    } catch (error) {
      throw new DatabaseException('listar prontuários do médico', error);
    }
  }
}
