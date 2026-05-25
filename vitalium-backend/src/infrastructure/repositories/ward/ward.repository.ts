import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { IWardRepository } from '../../../domain/interfaces/repositories/ward/ward.repository.interface';
import type { CreateWardDTO } from '../../../presentation/dto/wardDTO/create-ward.dto';
import type { UpdateWardDTO } from '../../../presentation/dto/wardDTO/update-ward.dto';
import { Ward } from '../../database/models/ward.models';

@Injectable()
export class WardRepository implements IWardRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateWardDTO): Promise<Ward> {
    const ward = await this.prisma.ward.create({
      data: {
        unitId: dto.unitId,
        name: dto.name,
        type: dto.type,
        capacity: dto.capacity,
        floor: dto.floor ?? null,
      },
      include: { unit: { select: { id: true, name: true, type: true } } },
    });
    return plainToInstance(Ward, ward);
  }

  async findById(id: string): Promise<Ward | null> {
    const ward = await this.prisma.ward.findUnique({
      where: { id },
      include: { unit: { select: { id: true, name: true, type: true } } },
    });
    return ward ? plainToInstance(Ward, ward) : null;
  }

  async findByUnitId(unitId: string): Promise<Ward[]> {
    const wards = await this.prisma.ward.findMany({
      where: { unitId, isActive: true },
      include: { unit: { select: { id: true, name: true, type: true } } },
      orderBy: { name: 'asc' },
    });
    return plainToInstance(Ward, wards);
  }

  async update(id: string, dto: UpdateWardDTO): Promise<Ward> {
    const ward = await this.prisma.ward.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.floor !== undefined && { floor: dto.floor }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { unit: { select: { id: true, name: true, type: true } } },
    });
    return plainToInstance(Ward, ward);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ward.delete({ where: { id } });
  }
}
