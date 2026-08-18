import type { DoctorUnitModel } from '@/services/api/doctors/GetDoctorById';

export function resolveDoctorActiveUnitId(
  units: DoctorUnitModel[],
  storedUnitId?: string | null,
): string | null {
  const unitIds = units.map((unit) => unit.id).filter(Boolean);

  if (unitIds.length === 0) {
    return null;
  }

  if (storedUnitId && unitIds.includes(storedUnitId)) {
    return storedUnitId;
  }

  return unitIds[0];
}
