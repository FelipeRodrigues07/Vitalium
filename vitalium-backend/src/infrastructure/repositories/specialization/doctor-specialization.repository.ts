import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/specialization/doctor-specialization.repository.interface';
import type { CreateDoctorSpecializationDTO } from '../../../presentation/dto/doctorSpecializationDTO/create-doctor-specialization.dto';
import { DoctorSpecialization } from '../../database/models/doctor-specialization.models';

const includeRelations = {
  doctor: {
    select: { id: true, crm: true },
  },
  specialization: {
    select: { id: true, name: true },
  },
};

@Injectable()
export class DoctorSpecializationRepository implements IDoctorSpecializationRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(
    dto: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecialization> {
    const link = await this.prisma.doctorSpecialization.upsert({
      where: {
        doctorId_specializationId: {
          doctorId: dto.doctorId,
          specializationId: dto.specializationId,
        },
      },
      update: {},
      create: {
        doctorId: dto.doctorId,
        specializationId: dto.specializationId,
      },
      include: includeRelations,
    });
    return plainToInstance(DoctorSpecialization, link);
  }

  async findById(id: string): Promise<DoctorSpecialization | null> {
    const link = await this.prisma.doctorSpecialization.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? plainToInstance(DoctorSpecialization, link) : null;
  }

  async findByDoctorId(doctorId: string): Promise<DoctorSpecialization[]> {
    const links = await this.prisma.doctorSpecialization.findMany({
      where: { doctorId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(DoctorSpecialization, links);
  }

  async findBySpecializationId(
    specializationId: string,
  ): Promise<DoctorSpecialization[]> {
    const links = await this.prisma.doctorSpecialization.findMany({
      where: { specializationId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(DoctorSpecialization, links);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.doctorSpecialization.delete({ where: { id } });
  }
}
