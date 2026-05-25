import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { IPatientCaregiverRepository } from '../../../domain/interfaces/repositories/patient-caregiver/patient-caregiver.repository.interface';
import type { CreatePatientCaregiverDTO } from '../../../presentation/dto/patientCaregiverDTO/create-patient-caregiver.dto';
import { PatientCaregiver } from '../../database/models/patient-caregiver.models';

const includeRelations = {
  patient: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  caregiver: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
};

@Injectable()
export class PatientCaregiverRepository implements IPatientCaregiverRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreatePatientCaregiverDTO): Promise<PatientCaregiver> {
    const link = await this.prisma.patientCaregiver.upsert({
      where: {
        patientId_caregiverId: {
          patientId: dto.patientId,
          caregiverId: dto.caregiverId,
        },
      },
      update: { isActive: true },
      create: { patientId: dto.patientId, caregiverId: dto.caregiverId },
      include: includeRelations,
    });
    return plainToInstance(PatientCaregiver, link);
  }

  async findById(id: string): Promise<PatientCaregiver | null> {
    const link = await this.prisma.patientCaregiver.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientCaregiver, link) : null;
  }

  async findByPatientId(patientId: string): Promise<PatientCaregiver[]> {
    const links = await this.prisma.patientCaregiver.findMany({
      where: { patientId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(PatientCaregiver, links);
  }

  async findByCaregiverId(caregiverId: string): Promise<PatientCaregiver[]> {
    const links = await this.prisma.patientCaregiver.findMany({
      where: { caregiverId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(PatientCaregiver, links);
  }

  async findByPatientAndCaregiver(
    patientId: string,
    caregiverId: string,
  ): Promise<PatientCaregiver | null> {
    const link = await this.prisma.patientCaregiver.findUnique({
      where: { patientId_caregiverId: { patientId, caregiverId } },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientCaregiver, link) : null;
  }

  async deactivate(id: string): Promise<PatientCaregiver> {
    const link = await this.prisma.patientCaregiver.update({
      where: { id },
      data: { isActive: false },
      include: includeRelations,
    });
    return plainToInstance(PatientCaregiver, link);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.patientCaregiver.delete({ where: { id } });
  }
}
