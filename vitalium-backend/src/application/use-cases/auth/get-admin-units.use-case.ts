import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';
import {
  isSuperAdmin,
  isUnitScopedAdmin,
} from '../../../shared/auth/auth-scope.helper';
import { Role } from '../../../shared/enums/role.enum';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

export interface AdminUnitSummary {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
}

@Injectable()
export class GetAdminUnitsUseCase {
  constructor(private readonly prisma: PrismaProvider) {}

  async execute(authUser: AuthJwtPayload): Promise<AdminUnitSummary[]> {
    if (authUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Apenas administradores podem listar unidades',
      );
    }

    if (isSuperAdmin(authUser)) {
      return this.prisma.unit.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          state: true,
        },
        orderBy: { name: 'asc' },
      });
    }

    if (isUnitScopedAdmin(authUser) && authUser.unitIds?.length) {
      return this.prisma.unit.findMany({
        where: {
          id: { in: authUser.unitIds },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          state: true,
        },
        orderBy: { name: 'asc' },
      });
    }

    return [];
  }
}
