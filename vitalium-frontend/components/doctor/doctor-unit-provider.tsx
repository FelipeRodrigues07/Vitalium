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
  clearDoctorActiveUnitId,
  getDoctorActiveUnitId,
  setDoctorActiveUnitId,
} from '@/services/auth/session';
import {
  GetDoctorByIdService,
  type DoctorDetailModel,
  type DoctorUnitModel,
} from '@/services/api/doctors/GetDoctorById';

interface DoctorUnitContextType {
  doctorId: string | null;
  units: DoctorUnitModel[];
  activeUnitId: string | null;
  activeUnit: DoctorUnitModel | null;
  isLoading: boolean;
  selectUnit: (unitId: string) => void;
}

const DoctorUnitContext = createContext<DoctorUnitContextType | undefined>(
  undefined,
);

export function DoctorUnitProvider({ children }: { children: ReactNode }) {
  const { user, isLoadingUser } = useAuth();
  const isDoctor = normalizeRole(user?.role) === 'doctor';

  const [doctor, setDoctor] = useState<DoctorDetailModel | null>(null);
  const [activeUnitId, setActiveUnitIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    if (!isDoctor) {
      setDoctor(null);
      setActiveUnitIdState(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        const profile = await GetDoctorByIdService.getMine();
        if (cancelled) return;

        const units = profile.units ?? [];
        const resolved = resolveDoctorActiveUnitId(
          units,
          getDoctorActiveUnitId(),
        );

        setDoctor(profile);

        if (resolved) {
          setDoctorActiveUnitId(resolved);
          setActiveUnitIdState(resolved);
        } else {
          clearDoctorActiveUnitId();
          setActiveUnitIdState(null);
        }
      } catch (error) {
        console.error('Falha ao carregar unidades do médico:', error);
        if (!cancelled) {
          setDoctor(null);
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
  }, [isDoctor, isLoadingUser, user?.id]);

  const selectUnit = useCallback(
    (unitId: string) => {
      const units = doctor?.units ?? [];
      if (!units.some((unit) => unit.id === unitId)) {
        return;
      }

      setDoctorActiveUnitId(unitId);
      setActiveUnitIdState(unitId);
    },
    [doctor?.units],
  );

  const units = doctor?.units ?? [];
  const activeUnit = units.find((unit) => unit.id === activeUnitId) ?? null;

  const value = useMemo(
    () => ({
      doctorId: doctor?.id ?? null,
      units,
      activeUnitId,
      activeUnit,
      isLoading: isLoadingUser || isLoading,
      selectUnit,
    }),
    [
      activeUnit,
      activeUnitId,
      doctor?.id,
      isLoading,
      isLoadingUser,
      selectUnit,
      units,
    ],
  );

  return (
    <DoctorUnitContext.Provider value={value}>
      {children}
    </DoctorUnitContext.Provider>
  );
}

export function useDoctorActiveUnit(): DoctorUnitContextType {
  const context = useContext(DoctorUnitContext);
  if (context === undefined) {
    throw new Error('useDoctorActiveUnit must be used within a DoctorUnitProvider');
  }
  return context;
}
