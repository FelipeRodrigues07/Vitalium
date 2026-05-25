import type { AuthAdminContext } from '../../domain/interfaces/repositories/auth/auth.repository.interface';
import type { User } from '../../infrastructure/database/models/user.models';
import { Role } from '../enums/role.enum';
import type { AuthJwtPayload } from '../types/auth-jwt-payload.interface';

export function buildAuthTokenPayload(
  user: User,
  adminContext: AuthAdminContext | null,
): AuthJwtPayload {
  const payload: AuthJwtPayload = {
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  if (user.role === Role.ADMIN && adminContext) {
    payload.adminId = adminContext.adminId;
    payload.adminRole = adminContext.adminRole;
    payload.unitIds = adminContext.unitIds;
  }

  return payload;
}

export function buildAuthUserResponse(
  user: User,
  adminContext: AuthAdminContext | null,
) {
  const response: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: User['role'];
    adminId?: string;
    adminRole?: AuthAdminContext['adminRole'];
    unitIds?: string[];
  } = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };

  if (user.role === Role.ADMIN && adminContext) {
    response.adminId = adminContext.adminId;
    response.adminRole = adminContext.adminRole;
    response.unitIds = adminContext.unitIds;
  }

  return response;
}
