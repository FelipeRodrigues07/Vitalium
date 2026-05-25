import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { CreateSpecializationDTO } from '../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { UpdateSpecializationDTO } from '../../../presentation/dto/specializationDTO/update-specialization.dto';
import { Specialization } from '../../database/models/specialization.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class SpecializationRepository implements ISpecializationRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateSpecializationDTO): Promise<Specialization> {
    const spec = await this.prisma.specialization.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return plainToInstance(Specialization, spec);
  }

  async findById(id: string): Promise<Specialization | null> {
    const spec = await this.prisma.specialization.findUnique({ where: { id } });
    return spec ? plainToInstance(Specialization, spec) : null;
  }

  async findByName(name: string): Promise<Specialization | null> {
    const spec = await this.prisma.specialization.findUnique({
      where: { name },
    });
    return spec ? plainToInstance(Specialization, spec) : null;
  }

  async findAll(filters?: Partial<Specialization>): Promise<Specialization[]> {
    const specs = await this.prisma.specialization.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: { name: 'asc' },
    });
    return plainToInstance(Specialization, specs);
  }

  async update(
    id: string,
    dto: UpdateSpecializationDTO,
  ): Promise<Specialization> {
    const spec = await this.prisma.specialization.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    return plainToInstance(Specialization, spec);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.specialization.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
