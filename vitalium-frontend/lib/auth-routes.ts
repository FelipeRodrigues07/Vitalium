import {
  isSuperAdmin,
  isUnitScopedAdmin,
  needsUnitSelection,
  resolveActiveUnitId,
} from '@/lib/admin-auth';
import type { UserProfile } from '@/types/auth';

export function normalizeRole(role?: string | null): string {
  return role?.trim().toLowerCase() ?? '';
}

export function getRoleHomePath(role?: string | null): string {
  switch (normalizeRole(role)) {
    case 'admin':
      return '/work/admin/dashboard';
    case 'doctor':
      return '/work/doctor/dashboard';
    case 'patient':
      return '/work/patient/dashboard';
    case 'nurse':
    case 'caregiver':
      return '/work';
    default:
      return '/login';
  }
}

export function getPostLoginPath(
  user: UserProfile,
  activeUnitId?: string | null,
): string {
  const role = normalizeRole(user.role);

  if (role !== 'admin') {
    return getRoleHomePath(user.role);
  }

  if (isSuperAdmin(user)) {
    return '/work/admin/platform';
  }

  if (isUnitScopedAdmin(user)) {
    const resolvedUnit = resolveActiveUnitId(user, activeUnitId);

    if (needsUnitSelection(user, resolvedUnit)) {
      return '/work/select-unit';
    }

    return '/work/admin/dashboard';
  }

  return '/work/admin/dashboard';
}
