import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import {
  ValidationException,
  type FieldError,
} from '../../../shared/execeptions/system/validation.exception';
import { ConflictException } from '../../../shared/execeptions/system/conflict.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import type { IPatientDoctorRepository } from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { CreatePatientDoctorDTO } from '../../../presentation/dto/patient-doctor/create-patient-doctor.dto';
import type { PatientDoctor } from '../../../infrastructure/database/models/patient-doctor.models';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import {
  getScopedUnitIds,
  isSuperAdmin,
  isUnitScopedAdmin,
} from '../../../shared/auth/auth-scope.helper';

@Injectable()
export class CreatePatientDoctorUseCase {
  constructor(
    @Inject('IPatientDoctorRepository')
    private readonly patientDoctorRepository: IPatientDoctorRepository,
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(
    dto: CreatePatientDoctorDTO,
    authUser?: AuthJwtPayload,
  ): Promise<PatientDoctor> {
    const errors: FieldError[] = [];

    if (!dto.patientId) {
      errors.push({
        field: 'patientId',
        value: dto.patientId,
        constraints: ['patientId é obrigatório'],
      });
    }

    if (!dto.doctorId) {
      errors.push({
        field: 'doctorId',
        value: dto.doctorId,
        constraints: ['doctorId é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const patient = await this.patientRepository.findById(dto.patientId);
      if (!patient) {
        throw new ValidationException([
          {
            field: 'patientId',
            value: dto.patientId,
            constraints: ['Paciente não encontrado'],
          },
        ]);
      }

      const doctor = await this.doctorRepository.findById(dto.doctorId);
      if (!doctor) {
        throw new ValidationException([
          {
            field: 'doctorId',
            value: dto.doctorId,
            constraints: ['Médico não encontrado'],
          },
        ]);
      }

      if (dto.unitId) {
        this.assertUnitScope(authUser, dto.unitId);
        await this.assertSharedUnit(dto.patientId, dto.doctorId, dto.unitId);
      }

      const existing =
        await this.patientDoctorRepository.findByPatientAndDoctor(
          dto.patientId,
          dto.doctorId,
        );

      if (existing && !existing.endDate) {
        throw new ConflictException(
          'Este médico já é o responsável ativo por este paciente',
          'patientId_doctorId',
          `${dto.patientId}_${dto.doctorId}`,
        );
      }

      const now = new Date();
      await this.patientDoctorRepository.endActiveLinksForPatient(
        dto.patientId,
        now,
      );

      if (existing?.endDate) {
        return await this.patientDoctorRepository.reactivateLink(
          existing.id,
          now,
        );
      }

      return await this.patientDoctorRepository.create({
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        startDate: now,
      });
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new DatabaseException('criar vínculo paciente-médico', error);
    }
  }

  private assertUnitScope(
    authUser: AuthJwtPayload | undefined,
    unitId: string,
  ) {
    if (!authUser || isSuperAdmin(authUser)) {
      return;
    }

    if (isUnitScopedAdmin(authUser)) {
      const scoped = getScopedUnitIds(authUser);
      if (!scoped.includes(unitId)) {
        throw new ForbiddenException(
          'Unidade não permitida para este administrador',
        );
      }
    }
  }

  private async assertSharedUnit(
    patientId: string,
    doctorId: string,
    unitId: string,
  ): Promise<void> {
    const patientUnit = await this.patientRepository.hasActiveUnitLink(
      patientId,
      unitId,
    );
    const doctorUnit = await this.doctorRepository.hasActiveUnitLink(
      doctorId,
      unitId,
    );

    if (!patientUnit) {
      throw new ValidationException([
        {
          field: 'unitId',
          value: unitId,
          constraints: ['Paciente não está vinculado a esta unidade'],
        },
      ]);
    }

    if (!doctorUnit) {
      throw new ValidationException([
        {
          field: 'unitId',
          value: unitId,
          constraints: ['Médico não está vinculado a esta unidade'],
        },
      ]);
    }
  }
}
