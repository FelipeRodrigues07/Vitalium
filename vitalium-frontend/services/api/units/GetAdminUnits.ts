import { authApi } from '@/services/api/auth/auth-api';
import type { AdminUnitSummary } from '@/types/auth';

export const GetAdminUnitsService = {
  getUnits: async (): Promise<AdminUnitSummary[]> => {
    return authApi.getAdminUnits();
  },
};
