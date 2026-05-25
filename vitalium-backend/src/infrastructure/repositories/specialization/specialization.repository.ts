import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
<<<<<<< HEAD
import { PrismaProvider } from '../../database/prisma.provider';
=======
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import type { CreateSpecializationDTO } from '../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { UpdateSpecializationDTO } from '../../../presentation/dto/specializationDTO/update-specialization.dto';
import { Specialization } from '../../database/models/specialization.models';
<<<<<<< HEAD
=======
import { PrismaProvider } from '../../database/prisma.provider';
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a

@Injectable()
export class SpecializationRepository implements ISpecializationRepository {
  constructor(private readonly prisma: PrismaProvider) {}

<<<<<<< HEAD
  async create(dto: CreateSpecializationDTO): Promise<Specialization> {
    const spec = await this.prisma.specialization.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
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
=======
  async create(
    createSpecializationDTO: CreateSpecializationDTO,
  ): Promise<Specialization> {
    const specialization = await this.prisma.specialization.create({
      data: {
        name: createSpecializationDTO.name,
        description: createSpecializationDTO.description ?? null,
        isActive: createSpecializationDTO.isActive,
      },
    });

    return plainToInstance(Specialization, specialization);
  }

  async findById(id: string): Promise<Specialization | null> {
    const specialization = await this.prisma.specialization.findFirst({
      where: { id, isActive: true },
      include: {
        doctors: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!specialization) return null;

    return plainToInstance(Specialization, specialization);
  }

  async findByName(name: string): Promise<Specialization | null> {
    const specialization = await this.prisma.specialization.findFirst({
      where: { name },
    });

    if (!specialization) return null;

    return plainToInstance(Specialization, specialization);
  }

  async findAll(): Promise<Specialization[]> {
    const specializations = await this.prisma.specialization.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        doctors: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return plainToInstance(Specialization, specializations);
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  }

  async update(
    id: string,
<<<<<<< HEAD
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
    await this.prisma.specialization.delete({ where: { id } });
=======
    updateSpecializationDTO: UpdateSpecializationDTO,
  ): Promise<Specialization> {
    const specialization = await this.prisma.specialization.update({
      where: { id },
      data: {
        name: updateSpecializationDTO.name,
        description: updateSpecializationDTO.description,
        isActive: updateSpecializationDTO.isActive,
      },
      include: {
        doctors: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return plainToInstance(Specialization, specialization);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.specialization.update({
      where: { id },
      data: { isActive: false },
    });
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  }
}
