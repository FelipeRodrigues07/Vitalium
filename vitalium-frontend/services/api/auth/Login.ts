import { authApi } from '@/services/api/auth/auth-api';
import type { LoginPayload, LoginResponse } from '@/types/auth';

export type { LoginPayload, LoginResponse };

/** @deprecated Use authApi.login or useAuth().login */
export const LoginService = {
  login: authApi.login,
};
