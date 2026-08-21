import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { ISecretaryUnitRepository } from '../../../domain/interfaces/repositories/secretary/secretary-unit.repository.interface';
import type { CreateSecretaryUnitDTO } from '../../../presentation/dto/secretaryUnitDTO/create-secretary-unit.dto';
import type { UpdateSecretaryUnitDTO } from '../../../presentation/dto/secretaryUnitDTO/update-secretary-unit.dto';
import { SecretaryUnit } from '../../database/models/secretary-unit.models';
import { PrismaProvider } from '../../database/prisma.provider';

const includeRelations = {
  secretary: {
    select: { id: true, isActive: true },
  },
  unit: {
    select: { id: true, name: true },
  },
};

@Injectable()
export class SecretaryUnitRepository implements ISecretaryUnitRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateSecretaryUnitDTO): Promise<SecretaryUnit> {
    const link = await this.prisma.secretaryUnit.upsert({
      where: {
        secretaryId_unitId: {
          secretaryId: dto.secretaryId,
          unitId: dto.unitId,
        },
      },
      update: {
        isActive: true,
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
      },
      create: {
        secretaryId: dto.secretaryId,
        unitId: dto.unitId,
        isPrimary: dto.isPrimary ?? false,
      },
      include: includeRelations,
    });
    return plainToInstance(SecretaryUnit, link);
  }

  async findById(id: string): Promise<SecretaryUnit | null> {
    const link = await this.prisma.secretaryUnit.findUnique({
      where: { id },
      include: includeRelations,
    });
    return link ? plainToInstance(SecretaryUnit, link) : null;
  }

  async findBySecretaryId(secretaryId: string): Promise<SecretaryUnit[]> {
    const links = await this.prisma.secretaryUnit.findMany({
      where: { secretaryId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(SecretaryUnit, links);
  }

  async findByUnitId(unitId: string): Promise<SecretaryUnit[]> {
    const links = await this.prisma.secretaryUnit.findMany({
      where: { unitId, isActive: true },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(SecretaryUnit, links);
  }

  async update(id: string, dto: UpdateSecretaryUnitDTO): Promise<SecretaryUnit> {
    const link = await this.prisma.secretaryUnit.update({
      where: { id },
      data: {
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: includeRelations,
    });
    return plainToInstance(SecretaryUnit, link);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secretaryUnit.delete({ where: { id } });
  }
}
