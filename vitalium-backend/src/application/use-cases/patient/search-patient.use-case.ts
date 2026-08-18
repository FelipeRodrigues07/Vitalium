import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { Patient } from '../../../infrastructure/database/models/patient.models';
import { Role } from '../../../shared/enums';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

@Injectable()
export class SearchPatientUseCase {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async findById(id: string): Promise<Patient> {
    if (!id) {
      throw new ValidationException([
        {
          field: 'id',
          value: id,
          constraints: ['ID é obrigatório'],
        },
      ]);
    }

    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new PatientNotFoundException(`ID: ${id}`);
    }

    return patient;
  }

  async findAll(): Promise<Patient[]> {
    const patients = await this.patientRepository.findAll();

    if (!patients || patients.length === 0) {
      throw new PatientNotFoundException();
    }

    return patients;
  }

  async findAllForAuthUser(
    authUser?: AuthJwtPayload,
    doctorId?: string,
    unitId?: string,
  ): Promise<Patient[]> {
    if (authUser?.role === Role.DOCTOR) {
      return this.findAllByDoctorUserId(authUser.sub, unitId);
    }

    if (doctorId) {
      return this.findAllByDoctorId(doctorId, unitId);
    }

    return this.findAll();
  }

  async findAllByDoctorUserId(
    userId: string,
    unitId?: string,
  ): Promise<Patient[]> {
    if (!userId) {
      throw new ValidationException([
        {
          field: 'userId',
          value: userId,
          constraints: ['userId é obrigatório'],
        },
      ]);
    }

    const doctor = await this.doctorRepository.findByUserId(userId);

    if (!doctor) {
      return [];
    }

    return this.patientRepository.findAllByDoctorId(doctor.id, unitId);
  }

  async findAllByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<Patient[]> {
    if (!doctorId) {
      throw new ValidationException([
        {
          field: 'doctorId',
          value: doctorId,
          constraints: ['doctorId é obrigatório'],
        },
      ]);
    }

    const doctor = await this.doctorRepository.findById(doctorId);

    if (!doctor) {
      throw new ValidationException([
        {
          field: 'doctorId',
          value: doctorId,
          constraints: ['Médico não encontrado'],
        },
      ]);
    }

    return this.patientRepository.findAllByDoctorId(doctorId, unitId);
  }

  async findByUserId(userId: string): Promise<Patient> {
    if (!userId) {
      throw new ValidationException([
        {
          field: 'userId',
          value: userId,
          constraints: ['userId é obrigatório'],
        },
      ]);
    }

    const patient = await this.patientRepository.findByUserId(userId);

    if (!patient) {
      throw new PatientNotFoundException(`userId: ${userId}`);
    }

    return patient;
  }
}
