import { Inject, Injectable } from '@nestjs/common';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/specialization/doctor-specialization.repository.interface';
import type { DoctorSpecialization } from '../../../infrastructure/database/models/doctor-specialization.models';
import type { CreateDoctorSpecializationDTO } from '../../../presentation/dto/doctorSpecializationDTO/create-doctor-specialization.dto';
import { DoctorSpecializationNotFoundException } from '../../../shared/execeptions/specialization/doctor-specialization-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';

@Injectable()
export class CreateDoctorSpecializationUseCase {
  constructor(
    @Inject('IDoctorSpecializationRepository')
    private readonly repo: IDoctorSpecializationRepository,
  ) {}
  async execute(
    dto: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecialization> {
    try {
      const existing = await this.repo.findByDoctorAndSpecialization(
        dto.doctorId,
        dto.specializationId,
      );
      if (existing) {
        throw new ValidationException([
          {
            field: 'doctorSpecialization',
            value: `${dto.doctorId}-${dto.specializationId}`,
            constraints: ['Médico já possui vínculo com esta especialização'],
          },
        ]);
      }
      return await this.repo.create(dto);
    } catch (error) {
      if (error instanceof ValidationException) throw error;
      // Prisma FK constraint (doctor or specialization not found)
      const err = error as { code?: string };
      if (err.code === 'P2003' || err.code === 'P2025') {
        throw new ValidationException([
          {
            field: 'doctorId',
            value: dto.doctorId,
            constraints: ['Médico ou especialização não encontrado(a)'],
          },
        ]);
      }
      throw new DatabaseException('vincular médico à especialização', error);
    }
  }
}

@Injectable()
export class SearchDoctorSpecializationUseCase {
  constructor(
    @Inject('IDoctorSpecializationRepository')
    private readonly repo: IDoctorSpecializationRepository,
  ) {}
  async findById(id: string): Promise<DoctorSpecialization> {
    try {
      const link = await this.repo.findById(id);
      if (!link) throw new DoctorSpecializationNotFoundException(id);
      return link;
    } catch (error) {
      if (error instanceof DoctorSpecializationNotFoundException) throw error;
      throw new DatabaseException(
        'buscar vínculo médico-especialização',
        error,
      );
    }
  }
  async findByDoctorId(doctorId: string): Promise<DoctorSpecialization[]> {
    try {
      return await this.repo.findByDoctorId(doctorId);
    } catch (error) {
      throw new DatabaseException('listar especializações do médico', error);
    }
  }
  async findBySpecializationId(
    specializationId: string,
  ): Promise<DoctorSpecialization[]> {
    try {
      return await this.repo.findBySpecializationId(specializationId);
    } catch (error) {
      throw new DatabaseException('listar médicos da especialização', error);
    }
  }
}

@Injectable()
export class DeleteDoctorSpecializationUseCase {
  constructor(
    @Inject('IDoctorSpecializationRepository')
    private readonly repo: IDoctorSpecializationRepository,
  ) {}
  async execute(id: string): Promise<void> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) throw new DoctorSpecializationNotFoundException(id);
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof DoctorSpecializationNotFoundException) throw error;
      throw new DatabaseException(
        'remover vínculo médico-especialização',
        error,
      );
    }
  }
}
