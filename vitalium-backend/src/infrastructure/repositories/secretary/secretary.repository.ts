import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { ISecretaryRepository } from '../../../domain/interfaces/repositories/secretary/secretary.repository.interface';
import type { CreateSecretaryDTO } from '../../../presentation/dto/secretaryDTO/create-secretary.dto';
import type { UpdateSecretaryDTO } from '../../../presentation/dto/secretaryDTO/update-secretary.dto';
import { Secretary } from '../../database/models/secretary.models';
import { PrismaProvider } from '../../database/prisma.provider';

const includeRelations = {
  user: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  units: {
    where: { isActive: true },
    include: { unit: true },
  },
};

@Injectable()
export class SecretaryRepository implements ISecretaryRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateSecretaryDTO): Promise<Secretary> {
    const secretary = await this.prisma.secretary.create({
      data: {
        userId: dto.userId,
        isActive: dto.isActive ?? true,
      },
      include: includeRelations,
    });
    return this.toModel(secretary);
  }

  async findById(id: string): Promise<Secretary | null> {
    const secretary = await this.prisma.secretary.findUnique({
      where: { id },
      include: includeRelations,
    });
    return secretary ? this.toModel(secretary) : null;
  }

  async findByUserId(userId: string): Promise<Secretary | null> {
    const secretary = await this.prisma.secretary.findUnique({
      where: { userId },
      include: includeRelations,
    });
    return secretary ? this.toModel(secretary) : null;
  }

  async findAll(filters?: { isActive?: boolean }): Promise<Secretary[]> {
    const secretaries = await this.prisma.secretary.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return secretaries.map((item) => this.toModel(item));
  }

  async update(id: string, dto: UpdateSecretaryDTO): Promise<Secretary> {
    const secretary = await this.prisma.secretary.update({
      where: { id },
      data: {
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: includeRelations,
    });
    return this.toModel(secretary);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.secretary.delete({ where: { id } });
  }

  async hasActiveUnitLink(
    secretaryId: string,
    unitId: string,
  ): Promise<boolean> {
    const link = await this.prisma.secretaryUnit.findFirst({
      where: {
        secretaryId,
        unitId,
        isActive: true,
      },
      select: { id: true },
    });
    return Boolean(link);
  }

  private toModel(secretary: {
    units?: { unit: unknown }[];
    [key: string]: unknown;
  }): Secretary {
    return plainToInstance(Secretary, {
      ...secretary,
      units: (secretary.units ?? []).map((item) => item.unit),
    });
  }
}
