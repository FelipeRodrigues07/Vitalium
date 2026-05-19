'use client';

import { useAuth } from '@/providers/auth-provider';

interface SessionState {
  isReady: boolean;
  accessToken: string | null;
  user: ReturnType<typeof useAuth>['user'];
}

/** Compatibilidade com componentes que já usam useSession */
export function useSession(): SessionState {
  const { user, accessToken, isLoadingUser } = useAuth();

  return {
    isReady: !isLoadingUser,
    accessToken,
    user,
  };
}
