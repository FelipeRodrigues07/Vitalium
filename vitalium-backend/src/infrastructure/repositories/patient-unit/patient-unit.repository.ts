import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { IPatientUnitRepository } from '../../../domain/interfaces/repositories/patient-unit/patient-unit.repository.interface';
import type { CreatePatientUnitDTO } from '../../../presentation/dto/patientUnitDTO/create-patient-unit.dto';
import type { UpdatePatientUnitDTO } from '../../../presentation/dto/patientUnitDTO/update-patient-unit.dto';
import { PatientUnit } from '../../database/models/patient-unit.models';

const includeRelations = {
  patient: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  unit: {
    select: { id: true, name: true, type: true, city: true, state: true },
  },
};

@Injectable()
export class PatientUnitRepository implements IPatientUnitRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreatePatientUnitDTO): Promise<PatientUnit> {
    const link = await this.prisma.patientUnit.upsert({
      where: {
        patientId_unitId: { patientId: dto.patientId, unitId: dto.unitId },
      },
      update: {
        isActive: true,
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      },
      create: {
        patientId: dto.patientId,
        unitId: dto.unitId,
        isPrimary: dto.isPrimary ?? false,
      },
      include: includeRelations,
    });
    return plainToInstance(PatientUnit, link);
  }

  async findById(id: string): Promise<PatientUnit | null> {
    const link = await this.prisma.patientUnit.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientUnit, link) : null;
  }

  async findByPatientId(patientId: string): Promise<PatientUnit[]> {
    const links = await this.prisma.patientUnit.findMany({
      where: { patientId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(PatientUnit, links);
  }

  async findByUnitId(unitId: string): Promise<PatientUnit[]> {
    const links = await this.prisma.patientUnit.findMany({
      where: { unitId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(PatientUnit, links);
  }

  async findByPatientAndUnit(
    patientId: string,
    unitId: string,
  ): Promise<PatientUnit | null> {
    const link = await this.prisma.patientUnit.findUnique({
      where: { patientId_unitId: { patientId, unitId } },
      include: includeRelations,
    });
    return link ? plainToInstance(PatientUnit, link) : null;
  }

  async update(id: string, dto: UpdatePatientUnitDTO): Promise<PatientUnit> {
    const link = await this.prisma.patientUnit.update({
      where: { id },
      data: {
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: includeRelations,
    });
    return plainToInstance(PatientUnit, link);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.patientUnit.delete({ where: { id } });
  }
}
