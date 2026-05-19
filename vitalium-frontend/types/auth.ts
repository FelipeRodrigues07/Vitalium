export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'CAREGIVER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
}

export interface RefreshTokenResponse {
  accessToken: string;
}
