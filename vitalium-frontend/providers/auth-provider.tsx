'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/services/api/auth/auth-api';
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  persistAuthSession,
  setAuthUser,
  setOnAccessTokenUpdated,
  setOnSessionCleared,
} from '@/services/auth/session';
import type { UserProfile } from '@/types/auth';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  isLoadingUser: boolean;
  fetchUserProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const fetchUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const profile = await authApi.getProfile();
      setAuthUser(profile);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      clearAuthSession();
      setUser(null);
      setAccessTokenState(null);
      return null;
    }
  }, []);

  useEffect(() => {
    setOnSessionCleared(() => {
      setUser(null);
      setAccessTokenState(null);
    });
    setOnAccessTokenUpdated((token) => {
      setAccessTokenState(token);
    });

    return () => {
      setOnSessionCleared(null);
      setOnAccessTokenUpdated(null);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getAuthUser();
        const token = getAccessToken();

        if (!token) {
          return;
        }

        setAccessTokenState(token);

        if (storedUser) {
          setUser(storedUser);
        }

        const profile = await fetchUserProfile();
        if (!profile) {
          clearAuthSession();
          setUser(null);
          setAccessTokenState(null);
        }
      } catch {
        clearAuthSession();
        setUser(null);
        setAccessTokenState(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    void initAuth();
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<UserProfile> => {
    const response = await authApi.login({ email, password });
    persistAuthSession(response);
    setAccessTokenState(response.accessToken);
    setUser(response.user);

    const profile = await fetchUserProfile();
    if (!profile) {
      clearAuthSession();
      setUser(null);
      setAccessTokenState(null);
      throw new Error('Não foi possível carregar o perfil do usuário.');
    }

    return profile;
  }, [fetchUserProfile]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (getAccessToken()) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      clearAuthSession();
      setUser(null);
      setAccessTokenState(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      login,
      logout,
      isLoadingUser,
      fetchUserProfile,
    }),
    [user, accessToken, isLoadingUser, fetchUserProfile, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
