import type { AdminUnitSummary, UserProfile } from '@/types/auth';

export function buildFallbackUnitsFromProfile(user: UserProfile): AdminUnitSummary[] {
  return (user.unitIds ?? []).map((id, index) => ({
    id,
    name: index === 0 ? 'Hospital Central' : index === 1 ? 'Clínica do Bairro' : `Unidade ${index + 1}`,
    type: index === 1 ? 'CLINIC' : 'HOSPITAL',
    city: 'São Paulo',
    state: 'SP',
  }));
}
