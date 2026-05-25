import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { INurseUnitRepository } from '../../../domain/interfaces/repositories/nurse/nurse-unit.repository.interface';
import type { CreateNurseUnitDTO } from '../../../presentation/dto/nurseUnitDTO/create-nurse-unit.dto';
import type { UpdateNurseUnitDTO } from '../../../presentation/dto/nurseUnitDTO/update-nurse-unit.dto';
import { NurseUnit } from '../../database/models/nouse-unit.models';

const includeRelations = {
  nurse: {
    select: { id: true, coren: true, corenState: true, isActive: true },
  },
  unit: {
    select: { id: true, name: true },
  },
};

@Injectable()
export class NurseUnitRepository implements INurseUnitRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateNurseUnitDTO): Promise<NurseUnit> {
    const link = await this.prisma.nurseUnit.upsert({
      where: {
        nurseId_unitId: { nurseId: dto.nurseId, unitId: dto.unitId },
      },
      update: {
        isActive: true,
        ...(dto.wardId !== undefined && { wardId: dto.wardId }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      },
      create: {
        nurseId: dto.nurseId,
        unitId: dto.unitId,
        wardId: dto.wardId ?? null,
        isPrimary: dto.isPrimary ?? false,
      },
      include: includeRelations,
    });
    return plainToInstance(NurseUnit, link);
  }

  async findById(id: string): Promise<NurseUnit | null> {
    const link = await this.prisma.nurseUnit.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? plainToInstance(NurseUnit, link) : null;
  }

  async findByNurseId(nurseId: string): Promise<NurseUnit[]> {
    const links = await this.prisma.nurseUnit.findMany({
      where: { nurseId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(NurseUnit, links);
  }

  async findByUnitId(unitId: string): Promise<NurseUnit[]> {
    const links = await this.prisma.nurseUnit.findMany({
      where: { unitId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(NurseUnit, links);
  }

  async findAll(filters?: Partial<NurseUnit>): Promise<NurseUnit[]> {
    const links = await this.prisma.nurseUnit.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(NurseUnit, links);
  }

  async update(id: string, dto: UpdateNurseUnitDTO): Promise<NurseUnit> {
    const link = await this.prisma.nurseUnit.update({
      where: { id },
      data: {
        ...(dto.wardId !== undefined && { wardId: dto.wardId }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: includeRelations,
    });
    return plainToInstance(NurseUnit, link);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.nurseUnit.delete({ where: { id } });
  }
}
