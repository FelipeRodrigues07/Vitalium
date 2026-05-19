import type { ListedUserModel } from '@/services/api/users/GetUsers';

export type DashboardUserRole =
  | 'doctor'
  | 'patient'
  | 'nurse'
  | 'admin'
  | 'caregiver';

export type DashboardUserStatus = 'active' | 'inactive';

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: DashboardUserRole;
  status: DashboardUserStatus;
  avatar?: string;
  createdAt: string;
  lastLogin: string | null;
}

export function mapRoleToApi(role: DashboardUserRole): ListedUserModel['role'] {
  switch (role) {
    case 'doctor':
      return 'DOCTOR';
    case 'patient':
      return 'PATIENT';
    case 'nurse':
      return 'NURSE';
    case 'admin':
      return 'ADMIN';
    case 'caregiver':
    default:
      return 'CAREGIVER';
  }
}

export function mapRole(role: ListedUserModel['role']): DashboardUserRole {
  switch (role) {
    case 'DOCTOR':
      return 'doctor';
    case 'PATIENT':
      return 'patient';
    case 'NURSE':
      return 'nurse';
    case 'ADMIN':
      return 'admin';
    case 'CAREGIVER':
    default:
      return 'caregiver';
  }
}

export function mapToDashboardUser(user: ListedUserModel): DashboardUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone ?? '-',
    role: mapRole(user.role),
    status: user.isActive ? 'active' : 'inactive',
    avatar: user.avatar,
    createdAt: user.createdAt,
    lastLogin: null,
  };
}

export const roleLabels: Record<DashboardUserRole, string> = {
  patient: 'Paciente',
  doctor: 'Médico',
  admin: 'Administrador',
  nurse: 'Enfermeira',
  caregiver: 'Cuidador',
};

export const statusLabels: Record<DashboardUserStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export const statusColors: Record<DashboardUserStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};
