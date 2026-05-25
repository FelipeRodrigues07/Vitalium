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
  }

  async update(
    id: string,
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
  }
}
