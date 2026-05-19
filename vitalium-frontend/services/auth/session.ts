import type { UserProfile } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_USER_KEY = 'authUser';

let onSessionCleared: (() => void) | null = null;
let onAccessTokenUpdated: ((token: string) => void) | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export type AuthUser = UserProfile;

export function setOnSessionCleared(callback: (() => void) | null): void {
  onSessionCleared = callback;
}

export function setOnAccessTokenUpdated(callback: ((token: string) => void) | null): void {
  onAccessTokenUpdated = callback;
}

export function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  onAccessTokenUpdated?.(token);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setAuthUser(user: AuthUser): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  if (!isBrowser()) return null;

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function persistAuthSession(data: {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
}

export function clearAuthSession(): void {
  if (!isBrowser()) return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  onSessionCleared?.();
}
