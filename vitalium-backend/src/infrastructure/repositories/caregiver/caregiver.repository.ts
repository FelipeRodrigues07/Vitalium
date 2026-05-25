import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { ICaregiverRepository } from '../../../domain/interfaces/repositories/caregiver/caregiver.repository.interface';
import type { CreateCaregiverDTO } from '../../../presentation/dto/caregiverDTO/create-caregiver.dto';
import type { UpdateCaregiverDTO } from '../../../presentation/dto/caregiverDTO/update-caregiver.dto';
import { Caregiver } from '../../database/models/caregiver.models';
import { PrismaProvider } from '../../database/prisma.provider';

const includeRelations = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
    },
  },
};

@Injectable()
export class CaregiverRepository implements ICaregiverRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateCaregiverDTO): Promise<Caregiver> {
    const caregiver = await this.prisma.caregiver.create({
      data: {
        userId: dto.userId,
        cpf: dto.cpf,
        relationship: dto.relationship,
      },
      include: includeRelations,
    });
    return plainToInstance(Caregiver, caregiver);
  }

  async findById(id: string): Promise<Caregiver | null> {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { id },
      include: includeRelations,
    });
    return caregiver ? plainToInstance(Caregiver, caregiver) : null;
  }

  async findByCpf(cpf: string): Promise<Caregiver | null> {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { cpf },
      include: includeRelations,
    });
    return caregiver ? plainToInstance(Caregiver, caregiver) : null;
  }

  async findByUserId(userId: string): Promise<Caregiver | null> {
    const caregiver = await this.prisma.caregiver.findUnique({
      where: { userId },
      include: includeRelations,
    });
    return caregiver ? plainToInstance(Caregiver, caregiver) : null;
  }

  async findAll(): Promise<Caregiver[]> {
    const caregivers = await this.prisma.caregiver.findMany({
      where: { isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(Caregiver, caregivers);
  }

  async findByPatientId(patientId: string): Promise<Caregiver[]> {
    const links = await this.prisma.patientCaregiver.findMany({
      where: { patientId, isActive: true },
      include: { caregiver: { include: includeRelations } },
    });
    return plainToInstance(
      Caregiver,
      links.map((l) => l.caregiver),
    );
  }

  async update(id: string, dto: UpdateCaregiverDTO): Promise<Caregiver> {
    const caregiver = await this.prisma.caregiver.update({
      where: { id },
      data: {
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.relationship !== undefined && {
          relationship: dto.relationship,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: includeRelations,
    });
    return plainToInstance(Caregiver, caregiver);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.caregiver.delete({ where: { id } });
  }

  async linkToPatient(caregiverId: string, patientId: string): Promise<void> {
    await this.prisma.patientCaregiver.upsert({
      where: { patientId_caregiverId: { patientId, caregiverId } },
      update: { isActive: true },
      create: { patientId, caregiverId },
    });
  }

  async unlinkFromPatient(
    caregiverId: string,
    patientId: string,
  ): Promise<void> {
    await this.prisma.patientCaregiver.update({
      where: { patientId_caregiverId: { patientId, caregiverId } },
      data: { isActive: false },
    });
  }
}
