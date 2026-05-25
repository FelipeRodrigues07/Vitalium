import { AdminRole } from '../enums/admin-role.enum';
import { Role } from '../enums/role.enum';
import type { AuthJwtPayload } from '../types/auth-jwt-payload.interface';

export function isSuperAdmin(authUser?: AuthJwtPayload | null): boolean {
  return (
    authUser?.role === Role.ADMIN &&
    authUser.adminRole === AdminRole.SUPER_ADMIN
  );
}

export function isUnitScopedAdmin(authUser?: AuthJwtPayload | null): boolean {
  return (
    authUser?.role === Role.ADMIN &&
    (authUser.adminRole === AdminRole.HOSPITAL_ADMIN ||
      authUser.adminRole === AdminRole.CLINIC_ADMIN) &&
    Array.isArray(authUser.unitIds) &&
    authUser.unitIds.length > 0
  );
}

export function getScopedUnitIds(authUser?: AuthJwtPayload | null): string[] {
  if (isSuperAdmin(authUser)) {
    return [];
  }

  return authUser?.unitIds ?? [];
}
