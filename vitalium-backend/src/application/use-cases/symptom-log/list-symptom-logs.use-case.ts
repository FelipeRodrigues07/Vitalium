import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IPatientDoctorRepository } from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { ISymptomLogRepository } from '../../../domain/interfaces/repositories/symptom-log/symptom-log.repository.interface';
import type { SymptomLog } from '../../../infrastructure/database/models/symptom-log.models';
import { Role } from '../../../shared/enums';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

@Injectable()
export class ListSymptomLogsUseCase {
  constructor(
    @Inject('ISymptomLogRepository')
    private readonly symptomLogRepository: ISymptomLogRepository,
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
    @Inject('IPatientDoctorRepository')
    private readonly patientDoctorRepository: IPatientDoctorRepository,
  ) {}

  async executeForAuthUser(authUser: AuthJwtPayload): Promise<SymptomLog[]> {
    if (authUser.role !== Role.PATIENT) {
      throw new ForbiddenException(
        'Apenas pacientes podem listar seus sintomas',
      );
    }

    const patient = await this.patientRepository.findByUserId(authUser.sub);

    if (!patient) {
      throw new ForbiddenException('Perfil de paciente não encontrado');
    }

    return this.findByPatientId(patient.id);
  }

  async executeForDoctor(
    patientId: string,
    authUser: AuthJwtPayload,
    unitId?: string,
  ): Promise<SymptomLog[]> {
    if (authUser.role === Role.ADMIN) {
      return this.findByPatientId(patientId, unitId);
    }

    if (authUser.role !== Role.DOCTOR) {
      throw new ForbiddenException(
        'Apenas médicos podem listar sintomas de pacientes',
      );
    }

    const doctor = await this.doctorRepository.findByUserId(authUser.sub);

    if (!doctor) {
      throw new ForbiddenException('Perfil de médico não encontrado');
    }

    const link = await this.patientDoctorRepository.findByPatientAndDoctor(
      patientId,
      doctor.id,
    );

    if (!link || link.endDate) {
      throw new ForbiddenException(
        'Você só pode ver sintomas de pacientes vinculados a você',
      );
    }

    return this.findByPatientId(patientId, unitId);
  }

  private async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<SymptomLog[]> {
    try {
      return await this.symptomLogRepository.findByPatientId(patientId, unitId);
    } catch (error) {
      throw new DatabaseException('listar sintomas', error);
    }
  }
}
