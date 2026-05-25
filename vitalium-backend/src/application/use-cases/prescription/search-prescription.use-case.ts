import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { PrescriptionNotFoundException } from '../../../shared/execeptions/prescription/prescription-not-found.exception';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import type { Prescription } from '../../../infrastructure/database/models/prescription.models';

@Injectable()
export class SearchPrescriptionUseCase {
  constructor(
    @Inject('IPrescriptionRepository')
    private readonly prescriptionRepository: IPrescriptionRepository,
  ) {}

  async findById(id: string): Promise<Prescription> {
    try {
      const prescription = await this.prescriptionRepository.findById(id);
      if (!prescription) throw new PrescriptionNotFoundException(id);
      return prescription;
    } catch (error) {
      if (error instanceof PrescriptionNotFoundException) throw error;
      throw new DatabaseException('buscar prescrição', error);
    }
  }

  async findByPatientId(patientId: string): Promise<Prescription[]> {
    try {
      return await this.prescriptionRepository.findByPatientId(patientId);
    } catch (error) {
      throw new DatabaseException('listar prescrições do paciente', error);
    }
  }

  async findByDoctorId(doctorId: string): Promise<Prescription[]> {
    try {
      return await this.prescriptionRepository.findByDoctorId(doctorId);
    } catch (error) {
      throw new DatabaseException('listar prescrições do médico', error);
    }
  }
}
