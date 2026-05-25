import { Inject, Injectable } from '@nestjs/common';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import type { Patient } from '../../../infrastructure/database/models/patient.models';
import type { CreatePatientDTO } from '../../../presentation/dto/patientDTO/create-patient.dto';
import { Role } from '../../../shared/enums/role.enum';
import { PatientAlreadyExistsException } from '../../../shared/execeptions/patient/patient-already-exists.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UnitInvalidException } from '../../../shared/execeptions/units/unit-invalid.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';

@Injectable()
export class CreatePatientUseCase {
  constructor(
    @Inject('IPatientRepository')
    private readonly patientRepository: IPatientRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUnitRepository')
    private readonly unitRepository: IUnitRepository,
  ) {}

  async execute(createPatientDTO: CreatePatientDTO): Promise<Patient> {
    const errors: FieldError[] = [];

    if (!createPatientDTO.cpf) {
      errors.push({
        field: 'cpf',
        value: createPatientDTO.cpf,
        constraints: ['CPF é obrigatório'],
      });
    }

    if (!createPatientDTO.birthDate) {
      errors.push({
        field: 'birthDate',
        value: createPatientDTO.birthDate,
        constraints: ['Data de nascimento é obrigatória'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      const user = await this.userRepository.findById(createPatientDTO.userId);
      if (!user) {
        throw new UserNotFoundException(`userId: ${createPatientDTO.userId}`);
      }

      if (user.role !== Role.PATIENT) {
        throw new ValidationException([
          {
            field: 'user.role',
            value: user.role,
            constraints: ['Usuário deve ter o role PATIENT'],
          },
        ]);
      }

      const existingByCpf = await this.patientRepository.findByCpf(
        createPatientDTO.cpf,
      );
      if (existingByCpf) {
        throw new PatientAlreadyExistsException(createPatientDTO.cpf);
      }

      const existingByUserId = await this.patientRepository.findByUserId(
        createPatientDTO.userId,
      );
      if (existingByUserId) {
        throw new PatientAlreadyExistsException(
          `userId ${createPatientDTO.userId}`,
        );
      }

      if (createPatientDTO.unitId) {
        const unit = await this.unitRepository.findById(
          createPatientDTO.unitId,
        );
        if (!unit) {
          throw new UnitInvalidException(createPatientDTO.unitId);
        }
      }

      return await this.patientRepository.create(createPatientDTO);
    } catch (error) {
      if (
        error instanceof PatientAlreadyExistsException ||
        error instanceof UserNotFoundException ||
        error instanceof ValidationException
      ) {
        throw error;
      }
      throw new DatabaseException('criar paciente', error);
    }
  }
}
