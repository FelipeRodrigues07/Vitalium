export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'CAREGIVER' | 'ADMIN' | 'SECRETARY';

export type AdminRole = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'CLINIC_ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  adminId?: string;
  adminRole?: AdminRole;
  unitIds?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface ProfileResponse {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  adminId?: string;
  adminRole?: AdminRole;
  unitIds?: string[];
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AdminUnitSummary {
  id: string;
  name: string;
  type: string;
  city: string | null;
  state: string | null;
}
