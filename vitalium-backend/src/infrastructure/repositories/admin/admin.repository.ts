import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import type { CreateAdminDTO } from '../../../presentation/dto/adminDTO/create-admin.dto';
import type { UpdateAdminDTO } from '../../../presentation/dto/adminDTO/update-admin.dto';
import { Admin } from '../../database/models/admin.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateAdminDTO): Promise<Admin> {
    const unitIds = dto.unitIds ?? [];

    const admin = await this.prisma.$transaction(async (tx) => {
      const created = await tx.admin.create({
        data: {
          userId: dto.userId,
          role: dto.role,
          isActive: dto.isActive ?? true,
        },
      });

      if (unitIds.length > 0) {
        await tx.adminUnit.createMany({
          data: unitIds.map((unitId, index) => ({
            adminId: created.id,
            unitId,
            isPrimary: index === 0,
            isActive: true,
          })),
        });
      }

      return tx.admin.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          user: true,
          units: { where: { isActive: true }, include: { unit: true } },
        },
      });
    });

    return plainToInstance(Admin, admin);
  }

  async findById(id: string): Promise<Admin | null> {
    const admin = await this.prisma.admin.findFirst({
      where: { id, isActive: true },
      include: { user: true },
    });

    if (!admin) return null;

    return plainToInstance(Admin, admin);
  }

  async findByUserId(userId: string): Promise<Admin | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!admin) return null;

    return plainToInstance(Admin, admin);
  }

  async findAll(): Promise<Admin[]> {
    const admins = await this.prisma.admin.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    return plainToInstance(Admin, admins);
  }

  async update(id: string, dto: UpdateAdminDTO): Promise<Admin> {
    const admin = await this.prisma.admin.update({
      where: { id },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { user: true },
    });

    return plainToInstance(Admin, admin);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
