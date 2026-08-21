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
import { resolveDoctorActiveUnitId } from '@/lib/doctor-unit';
import { normalizeRole } from '@/lib/auth-routes';
import { useAuth } from '@/providers/auth-provider';
import {
  clearSecretaryActiveUnitId,
  getSecretaryActiveUnitId,
  setSecretaryActiveUnitId,
} from '@/services/auth/session';
import {
  GetSecretaryService,
  type SecretaryDetailModel,
  type SecretaryUnitModel,
} from '@/services/api/secretaries';

interface SecretaryUnitContextType {
  secretaryId: string | null;
  units: SecretaryUnitModel[];
  activeUnitId: string | null;
  activeUnit: SecretaryUnitModel | null;
  isLoading: boolean;
  selectUnit: (unitId: string) => void;
}

const SecretaryUnitContext = createContext<SecretaryUnitContextType | undefined>(
  undefined,
);

export function SecretaryUnitProvider({ children }: { children: ReactNode }) {
  const { user, isLoadingUser } = useAuth();
  const isSecretary = normalizeRole(user?.role) === 'secretary';

  const [secretary, setSecretary] = useState<SecretaryDetailModel | null>(null);
  const [activeUnitId, setActiveUnitIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!isSecretary) {
      setSecretary(null);
      setActiveUnitIdState(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const profile = await GetSecretaryService.getMine();
        if (cancelled) return;

        const units = profile.units ?? [];
        const resolved = resolveDoctorActiveUnitId(
          units,
          getSecretaryActiveUnitId(),
        );

        setSecretary(profile);

        if (resolved) {
          setSecretaryActiveUnitId(resolved);
          setActiveUnitIdState(resolved);
        } else {
          clearSecretaryActiveUnitId();
          setActiveUnitIdState(null);
        }
      } catch (error) {
        console.error('Falha ao carregar unidades da secretaria:', error);
        if (!cancelled) {
          setSecretary(null);
          setActiveUnitIdState(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isSecretary, isLoadingUser, user?.id]);

  const selectUnit = useCallback(
    (unitId: string) => {
      const units = secretary?.units ?? [];
      if (!units.some((unit) => unit.id === unitId)) {
        return;
      }

      setSecretaryActiveUnitId(unitId);
      setActiveUnitIdState(unitId);
    },
    [secretary?.units],
  );

  const units = secretary?.units ?? [];
  const activeUnit = units.find((unit) => unit.id === activeUnitId) ?? null;

  const value = useMemo(
    () => ({
      secretaryId: secretary?.id ?? null,
      units,
      activeUnitId,
      activeUnit,
      isLoading: isLoadingUser || isLoading,
      selectUnit,
    }),
    [
      activeUnit,
      activeUnitId,
      isLoading,
      isLoadingUser,
      secretary?.id,
      selectUnit,
      units,
    ],
  );

  return (
    <SecretaryUnitContext.Provider value={value}>
      {children}
    </SecretaryUnitContext.Provider>
  );
}

export function useSecretaryActiveUnit(): SecretaryUnitContextType {
  const context = useContext(SecretaryUnitContext);
  if (context === undefined) {
    throw new Error(
      'useSecretaryActiveUnit must be used within a SecretaryUnitProvider',
    );
  }
  return context;
}
