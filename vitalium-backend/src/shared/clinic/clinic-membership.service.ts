import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { IDoctorRepository } from '../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IPatientRepository } from '../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { ISecretaryRepository } from '../../domain/interfaces/repositories/secretary/secretary.repository.interface';
import { isUnitScopedAdmin } from '../auth/auth-scope.helper';
import { Role } from '../enums/role.enum';
import {
  type FieldError,
  ValidationException,
} from '../execeptions/system/validation.exception';
import type { AuthJwtPayload } from '../types/auth-jwt-payload.interface';

@Injectable()
export class ClinicMembershipService {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
    @Inject('ISecretaryRepository')
    private readonly secretaryRepository: ISecretaryRepository,
  ) {}

  async assertDoctorAndPatientInUnit(
    doctorId: string,
    patientId: string,
    unitId: string,
  ): Promise<void> {
    const normalizedUnitId = this.normalizeUnitId(unitId);

    if (!normalizedUnitId) {
      throw this.requiredUnitException(unitId);
    }

    const [patientLinked, doctorLinked] = await Promise.all([
      this.patientRepository.hasActiveUnitLink(patientId, normalizedUnitId),
      this.doctorRepository.hasActiveUnitLink(doctorId, normalizedUnitId),
    ]);

    const errors: FieldError[] = [];

    if (!patientLinked) {
      errors.push({
        field: 'unitId',
        value: normalizedUnitId,
        constraints: ['Paciente não está vinculado a esta unidade'],
      });
    }

    if (!doctorLinked) {
      errors.push({
        field: 'unitId',
        value: normalizedUnitId,
        constraints: ['Médico não está vinculado a esta unidade'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  async resolveDoctorListUnitId(
    authUser: AuthJwtPayload,
    unitId?: string,
  ): Promise<string | undefined> {
    const resolved = this.requireUnitIdIfScopedStaff(authUser, unitId);

    if (authUser.role === Role.DOCTOR && resolved) {
      await this.assertDoctorLinkedToUnit(authUser, resolved);
    }

    if (authUser.role === Role.SECRETARY && resolved) {
      await this.assertSecretaryLinkedToUnit(authUser, resolved);
    }

    return resolved;
  }

  async assertCanAccessUnitRecord(
    authUser: AuthJwtPayload,
    recordUnitId: string,
    requestedUnitId?: string,
  ): Promise<void> {
    if (authUser.role === Role.DOCTOR) {
      const unitId = this.requireUnitIdIfScopedStaff(authUser, requestedUnitId);
      await this.assertDoctorLinkedToUnit(authUser, unitId as string);

      if (recordUnitId !== unitId) {
        throw new NotFoundException('Registro não encontrado nesta unidade');
      }

      return;
    }

    if (authUser.role === Role.SECRETARY) {
      const unitId = this.requireUnitIdIfScopedStaff(authUser, requestedUnitId);
      await this.assertSecretaryLinkedToUnit(authUser, unitId as string);

      if (recordUnitId !== unitId) {
        throw new NotFoundException('Registro não encontrado nesta unidade');
      }

      return;
    }

    if (
      isUnitScopedAdmin(authUser) &&
      !authUser.unitIds?.includes(recordUnitId)
    ) {
      throw new NotFoundException('Registro não encontrado nesta unidade');
    }
  }

  async assertDoctorLinkedToUnit(
    authUser: AuthJwtPayload,
    unitId: string,
  ): Promise<void> {
    if (authUser.role !== Role.DOCTOR) {
      return;
    }

    const doctor = await this.doctorRepository.findByUserId(authUser.sub);

    if (!doctor) {
      throw new ForbiddenException('Perfil de médico não encontrado');
    }

    const linked = await this.doctorRepository.hasActiveUnitLink(
      doctor.id,
      unitId,
    );

    if (!linked) {
      throw new ValidationException([
        {
          field: 'unitId',
          value: unitId,
          constraints: ['Médico não está vinculado a esta unidade'],
        },
      ]);
    }
  }

  async assertSecretaryLinkedToUnit(
    authUser: AuthJwtPayload,
    unitId: string,
  ): Promise<void> {
    if (authUser.role !== Role.SECRETARY) {
      return;
    }

    const secretary = await this.secretaryRepository.findByUserId(authUser.sub);

    if (!secretary) {
      throw new ForbiddenException('Perfil de secretária(o) não encontrado');
    }

    const linked = await this.secretaryRepository.hasActiveUnitLink(
      secretary.id,
      unitId,
    );

    if (!linked) {
      throw new ValidationException([
        {
          field: 'unitId',
          value: unitId,
          constraints: ['Secretária(o) não está vinculada(o) a esta unidade'],
        },
      ]);
    }
  }

  async assertStaffCanAccessUnit(
    authUser: AuthJwtPayload,
    unitId: string,
  ): Promise<void> {
    if (authUser.role === Role.DOCTOR) {
      await this.assertDoctorLinkedToUnit(authUser, unitId);
      return;
    }

    if (authUser.role === Role.SECRETARY) {
      await this.assertSecretaryLinkedToUnit(authUser, unitId);
    }
  }

  requireUnitIdIfDoctor(
    authUser: AuthJwtPayload,
    unitId?: string,
  ): string | undefined {
    return this.requireUnitIdIfScopedStaff(authUser, unitId);
  }

  requireUnitIdIfScopedStaff(
    authUser: AuthJwtPayload,
    unitId?: string,
  ): string | undefined {
    const normalized = this.normalizeUnitId(unitId);

    if (authUser.role !== Role.DOCTOR && authUser.role !== Role.SECRETARY) {
      return normalized;
    }

    if (!normalized) {
      throw this.requiredUnitException(unitId);
    }

    return normalized;
  }

  private normalizeUnitId(unitId?: string): string | undefined {
    const value = unitId?.trim();
    return value ? value : undefined;
  }

  private requiredUnitException(unitId?: string): ValidationException {
    return new ValidationException([
      {
        field: 'unitId',
        value: unitId,
        constraints: ['Unidade é obrigatória'],
      },
    ]);
  }
}
