import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { INurseRepository } from '../../../domain/interfaces/repositories/nurse/nurse.repository.interface';
import type { CreateNurseDTO } from '../../../presentation/dto/nurseDTO/create-nurse.dto';
import type { UpdateNurseDTO } from '../../../presentation/dto/nurseDTO/update-nurse.dto';
import { Nurse } from '../../database/models/nurse.models';
import { PrismaProvider } from '../../database/prisma.provider';

const includeRelations = {
  user: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
};

@Injectable()
export class NurseRepository implements INurseRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateNurseDTO): Promise<Nurse> {
    const nurse = await this.prisma.nurse.create({
      data: {
        userId: dto.userId,
        coren: dto.coren,
        corenState: dto.corenState,
      },
      include: includeRelations,
    });
    return plainToInstance(Nurse, nurse);
  }

  async findById(id: string): Promise<Nurse | null> {
    const nurse = await this.prisma.nurse.findUnique({
      where: { id },
      include: includeRelations,
    });
    return nurse ? plainToInstance(Nurse, nurse) : null;
  }

  async findByUserId(userId: string): Promise<Nurse | null> {
    const nurse = await this.prisma.nurse.findUnique({
      where: { userId },
      include: includeRelations,
    });
    return nurse ? plainToInstance(Nurse, nurse) : null;
  }

  async findByCoren(coren: string): Promise<Nurse | null> {
    const nurse = await this.prisma.nurse.findUnique({
      where: { coren },
      include: includeRelations,
    });
    return nurse ? plainToInstance(Nurse, nurse) : null;
  }

  async findAll(filters?: Partial<Nurse>): Promise<Nurse[]> {
    const nurses = await this.prisma.nurse.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(Nurse, nurses);
  }

  async update(id: string, dto: UpdateNurseDTO): Promise<Nurse> {
    const nurse = await this.prisma.nurse.update({
      where: { id },
      data: {
        ...(dto.coren !== undefined && { coren: dto.coren }),
        ...(dto.corenState !== undefined && { corenState: dto.corenState }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: includeRelations,
    });
    return plainToInstance(Nurse, nurse);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.nurse.delete({ where: { id } });
  }
}
