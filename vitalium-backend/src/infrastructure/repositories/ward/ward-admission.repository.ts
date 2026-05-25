import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { IWardAdmissionRepository } from '../../../domain/interfaces/repositories/ward/ward-admission.repository.interface';
import type { CreateWardAdmissionDTO } from '../../../presentation/dto/wardAdmissionDTO/create-ward-admission.dto';
import type { UpdateWardAdmissionDTO } from '../../../presentation/dto/wardAdmissionDTO/update-ward-admission.dto';
import { WardAdmission } from '../../database/models/ward-admission.models';

const includeRelations = {
  patient: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
  ward: { include: { unit: { select: { id: true, name: true } } } },
};

@Injectable()
export class WardAdmissionRepository implements IWardAdmissionRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateWardAdmissionDTO): Promise<WardAdmission> {
    const admission = await this.prisma.wardAdmission.create({
      data: {
        patientId: dto.patientId,
        wardId: dto.wardId,
        reason: dto.reason,
        admissionDate: dto.admissionDate
          ? new Date(dto.admissionDate)
          : new Date(),
        status: dto.status ?? 'ACTIVE',
        notes: dto.notes ?? null,
      },
      include: includeRelations,
    });
    return plainToInstance(WardAdmission, admission);
  }

  async findById(id: string): Promise<WardAdmission | null> {
    const admission = await this.prisma.wardAdmission.findUnique({
      where: { id },
      include: includeRelations,
    });
    return admission ? plainToInstance(WardAdmission, admission) : null;
  }

  async findByPatientId(patientId: string): Promise<WardAdmission[]> {
    const admissions = await this.prisma.wardAdmission.findMany({
      where: { patientId },
      include: includeRelations,
      orderBy: { admissionDate: 'desc' },
    });
    return plainToInstance(WardAdmission, admissions);
  }

  async findByWardId(wardId: string): Promise<WardAdmission[]> {
    const admissions = await this.prisma.wardAdmission.findMany({
      where: { wardId },
      include: includeRelations,
      orderBy: { admissionDate: 'desc' },
    });
    return plainToInstance(WardAdmission, admissions);
  }

  async update(
    id: string,
    dto: UpdateWardAdmissionDTO,
  ): Promise<WardAdmission> {
    const admission = await this.prisma.wardAdmission.update({
      where: { id },
      data: {
        ...(dto.dischargeDate !== undefined && {
          dischargeDate: new Date(dto.dischargeDate),
        }),
        ...(dto.reason !== undefined && { reason: dto.reason }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: includeRelations,
    });
    return plainToInstance(WardAdmission, admission);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wardAdmission.delete({ where: { id } });
  }
}
