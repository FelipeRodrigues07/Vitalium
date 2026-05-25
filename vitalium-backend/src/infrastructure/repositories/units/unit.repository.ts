import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import type { CreateUnitDTO } from '../../../presentation/dto/unitDTO/create-unit.dto';
import type { UpdateUnitDTO } from '../../../presentation/dto/unitDTO/update-unit.dto';
import { Unit } from '../../database/models/unit.models';
import { PrismaProvider } from '../database/prisma.provider';

@Injectable()
export class UnitRepository implements IUnitRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(createUnitDTO: CreateUnitDTO): Promise<Unit> {
    const result = await this.prisma.unit.create({
      data: createUnitDTO,
    });
    return plainToInstance(Unit, result);
  }

  async findById(id: string): Promise<Unit | null> {
    const result = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!result) return null;

    return plainToInstance(Unit, result);
  }

  async findByCnpj(cnpj: string): Promise<Unit | null> {
    const result = await this.prisma.unit.findUnique({
      where: { cnpj },
    });

    if (!result) return null;

    return plainToInstance(Unit, result);
  }

  async update(id: string, updateUnitDTO: UpdateUnitDTO): Promise<Unit> {
    const result = await this.prisma.unit.update({
      where: { id },
      data: updateUnitDTO,
    });

    return plainToInstance(Unit, result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unit.delete({
      where: { id },
    });
  }

  async deleteMany(where: any) {
    return this.prisma.unit.deleteMany({
      where,
    });
  }
}
