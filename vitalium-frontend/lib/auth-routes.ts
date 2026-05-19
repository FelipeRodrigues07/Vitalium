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
