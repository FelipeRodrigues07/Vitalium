import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { User } from '../../../infrastructure/database/models/user.models';
import type { Patient } from '../../../infrastructure/database/models/patient.models';
import type { Doctor } from '../../../infrastructure/database/models/doctor.models';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import { Role } from '../../../shared/enums';
import {
  getScopedUnitIds,
  isSuperAdmin,
  isUnitScopedAdmin,
} from '../../../shared/auth/auth-scope.helper';
@Injectable()
export class SearchUserUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  //Buscar usuário por ID
  async findById(id: string): Promise<User> {
    if (!id) {
      throw new ValidationException([
        {
          field: 'id',
          value: id,
          constraints: ['ID é obrigatório'],
        },
      ]);
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    if (!email) {
      throw new ValidationException([
        {
          field: 'email',
          value: email,
          constraints: ['Email é obrigatório'],
        },
      ]);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationException([
        {
          field: 'email',
          value: email,
          constraints: ['Formato de email inválido'],
        },
      ]);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  async findAll(
    authUser?: AuthJwtPayload,
    filterUnitId?: string,
  ): Promise<User[]> {
    const scopedUnitIds = getScopedUnitIds(authUser);
    let users: User[];

    if (filterUnitId) {
      if (isSuperAdmin(authUser)) {
        users = await this.userRepository.findAllByUnitIds([filterUnitId]);
        return this.attachResponsibleDoctors(users, [filterUnitId]);
      }

      if (isUnitScopedAdmin(authUser)) {
        if (!scopedUnitIds.includes(filterUnitId)) {
          throw new ForbiddenException(
            'Unidade não permitida para este administrador',
          );
        }
        users = await this.userRepository.findAllByUnitIds([filterUnitId]);
        return this.attachResponsibleDoctors(users, [filterUnitId]);
      }
    }

    if (isUnitScopedAdmin(authUser) && scopedUnitIds.length > 0) {
      users = await this.userRepository.findAllByUnitIds(scopedUnitIds);
      return this.attachResponsibleDoctors(users, scopedUnitIds);
    }

    users = await this.userRepository.findAll();
    return this.attachResponsibleDoctors(users);
  }

  private attachResponsibleDoctors(
    users: User[],
    unitIds?: string[],
  ): User[] {
    for (const user of users) {
      if (user.role !== Role.PATIENT || !user.patient) {
        continue;
      }

      const doctor = this.resolveResponsibleDoctor(user.patient, unitIds);
      if (!doctor?.user) {
        continue;
      }

      user.responsibleDoctorName =
        `${doctor.user.firstName} ${doctor.user.lastName}`.trim();
      user.responsibleDoctorCrm = doctor.crm;
    }

    return users;
  }

  private resolveResponsibleDoctor(
    patient: Patient,
    unitIds?: string[],
  ): Doctor | null {
    const links = patient.patientDoctors ?? [];

    for (const link of links) {
      const doctor = link.doctor;
      if (!doctor?.user) {
        continue;
      }

      if (unitIds?.length) {
        const doctorUnits = doctor.units ?? [];
        const inScopedUnit = doctorUnits.some((du) =>
          unitIds.includes(du.unitId),
        );
        if (!inScopedUnit) {
          continue;
        }
      }

      return doctor;
    }

    return null;
  }
}
