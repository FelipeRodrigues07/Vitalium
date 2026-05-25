import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type {
  AuthAdminContext,
  IAuthRepository,
} from '../../../domain/interfaces/repositories/auth/auth.repository.interface';
import { AdminRole } from '../../../shared/enums/admin-role.enum';
import { User } from '../../database/models/user.models';
import { PrismaProvider } from '../../database/prisma.provider';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async findByEmailWithOutPassword(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email, isActive: true },
    });

    if (!user) return null;

    return plainToInstance(User, user);
  }

  async findByIdWithRefreshToken(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, isActive: true },
    });

    if (!user) return null;

    return plainToInstance(User, user);
  }

  async findAdminContextByUserId(
    userId: string,
  ): Promise<AuthAdminContext | null> {
    const admin = await this.prisma.admin.findFirst({
      where: { userId, isActive: true },
      include: {
        units: {
          where: { isActive: true },
          select: { unitId: true },
        },
      },
    });

    if (!admin) {
      return null;
    }

    return {
      adminId: admin.id,
      adminRole: admin.role as AdminRole,
      unitIds: admin.units.map((link) => link.unitId),
    };
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    if (!userId) {
      return;
    }

    await this.prisma.user.updateMany({
      where: { id: userId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
        updatedAt: new Date(),
      },
    });
  }
}
