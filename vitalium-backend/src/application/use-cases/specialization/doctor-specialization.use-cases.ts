import { Inject, Injectable } from '@nestjs/common';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { DoctorSpecializationNotFoundException } from '../../../shared/execeptions/specialization/doctor-specialization-not-found.exception';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/specialization/doctor-specialization.repository.interface';
import type { CreateDoctorSpecializationDTO } from '../../../presentation/dto/doctorSpecializationDTO/create-doctor-specialization.dto';
import type { DoctorSpecialization } from '../../../infrastructure/database/models/doctor-specialization.models';

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
      return await this.repo.create(dto);
    } catch (error) {
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
