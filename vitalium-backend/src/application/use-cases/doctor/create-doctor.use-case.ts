import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import type { Doctor } from '../../../infrastructure/database/models/doctor.models';
import type { CreateDoctorDTO } from '../../../presentation/dto/doctorDTO/create-doctor.dto';
import { Role } from '../../../shared/enums/role.enum';
import { DoctorAlreadyExistsException } from '../../../shared/execeptions/doctor/doctor-already-exists.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  type FieldError,
  ValidationException,
} from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';

@Injectable()
export class CreateDoctorUseCase {
  constructor(
    @Inject('IDoctorRepository')
    private readonly doctorRepository: IDoctorRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(createDoctorDTO: CreateDoctorDTO): Promise<Doctor> {
    const errors: FieldError[] = [];

    if (!createDoctorDTO.crm) {
      errors.push({
        field: 'crm',
        value: createDoctorDTO.crm,
        constraints: ['Crm é obrigatório'],
      });
    }

    if (errors.length > 0) {
      throw new ValidationException(errors);
    }

    try {
      let user = null;
      if (createDoctorDTO.userId) {
        user = await this.userRepository.findById(createDoctorDTO.userId);
        if (!user) {
          throw new UserNotFoundException(`userId: ${createDoctorDTO.userId}`);
        }
      }

      if (user && user.role !== Role.DOCTOR) {
        throw new ValidationException([
          {
            field: 'user.role',
            value: user.role,
            constraints: ['Usuário deve ter o role DOCTOR'],
          },
        ]);
      }

      const doctorExisting = await this.doctorRepository.findByCrm(
        createDoctorDTO.crm,
      );
      if (doctorExisting) {
        throw new DoctorAlreadyExistsException(createDoctorDTO.crm);
      }

      // Check if userId is already associated with another doctor
      if (createDoctorDTO.userId) {
        const doctorByUserId = await this.doctorRepository.findByUserId(
          createDoctorDTO.userId,
        );
        if (doctorByUserId) {
          throw new DoctorAlreadyExistsException(
            `userId ${createDoctorDTO.userId}`,
          );
        }
      }

      const doctorData = {
        ...createDoctorDTO,
        user: user,
      };

      const doctor = await this.doctorRepository.create(doctorData);
      return doctor;
    } catch (error) {
      if (
        error instanceof ValidationException ||
        error instanceof DoctorAlreadyExistsException ||
        error instanceof UserNotFoundException
      ) {
        throw error;
      }
      throw new DatabaseException('criar médico', error);
    }
  }
}
