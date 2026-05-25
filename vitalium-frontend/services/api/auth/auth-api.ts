import axios from 'axios';
import { api } from '@/services/api/api';
import type {
  LoginPayload,
  LoginResponse,
  ProfileResponse,
  RefreshTokenResponse,
  UserProfile,
} from '@/types/auth';

export function mapProfileToUser(profile: ProfileResponse): UserProfile {
  return {
    id: profile.sub,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    adminId: profile.adminId,
    adminRole: profile.adminRole,
    unitIds: profile.unitIds,
  };
}

function mapLoginUser(user: LoginResponse['user']): UserProfile {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    adminId: user.adminId,
    adminRole: user.adminRole,
    unitIds: user.unitIds,
  };
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', payload);
    return {
      ...response.data,
      user: mapLoginUser(response.data.user),
    };
  },

  getAdminUnits: async () => {
    const response = await api.get<import('@/types/auth').AdminUnitSummary[]>(
      '/auth/units',
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ProfileResponse>('/auth/profile');
    return mapProfileToUser(response.data);
  },

  checkAuth: async (): Promise<boolean> => {
    try {
      await api.get<ProfileResponse>('/auth/profile');
      return true;
    } catch {
      return false;
    }
  },

  refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await axios.post<RefreshTokenResponse>(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    return response.data;
  },
};
