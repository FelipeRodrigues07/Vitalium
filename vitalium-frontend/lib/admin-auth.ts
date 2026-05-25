import type { AdminRole, UserProfile } from '@/types/auth';
import { normalizeRole } from '@/lib/auth-routes';

export function isSuperAdmin(user?: UserProfile | null): boolean {
  return (
    normalizeRole(user?.role) === 'admin' && user?.adminRole === 'SUPER_ADMIN'
  );
}

export function isUnitScopedAdmin(user?: UserProfile | null): boolean {
  return (
    normalizeRole(user?.role) === 'admin' &&
    (user?.adminRole === 'HOSPITAL_ADMIN' || user?.adminRole === 'CLINIC_ADMIN')
  );
}

export function getAdminUnitIds(user?: UserProfile | null): string[] {
  return user?.unitIds ?? [];
}

export function needsUnitSelection(
  user?: UserProfile | null,
  activeUnitId?: string | null,
): boolean {
  if (!isUnitScopedAdmin(user)) {
    return false;
  }

  const unitIds = getAdminUnitIds(user);
  if (unitIds.length <= 1) {
    return false;
  }

  return !activeUnitId || !unitIds.includes(activeUnitId);
}

export function resolveActiveUnitId(
  user?: UserProfile | null,
  storedActiveUnitId?: string | null,
): string | null {
  const unitIds = getAdminUnitIds(user);

  if (!isUnitScopedAdmin(user) || unitIds.length === 0) {
    return null;
  }

  if (unitIds.length === 1) {
    return unitIds[0];
  }

  if (storedActiveUnitId && unitIds.includes(storedActiveUnitId)) {
    return storedActiveUnitId;
  }

  return null;
}

export function adminRoleLabel(role?: AdminRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super administrador';
    case 'HOSPITAL_ADMIN':
      return 'Administrador hospitalar';
    case 'CLINIC_ADMIN':
      return 'Administrador de clínica';
    default:
      return 'Administrador';
  }
}
