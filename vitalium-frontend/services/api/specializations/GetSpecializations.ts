import { api } from '@/services/api/api';

export interface SpecializationModel {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export const GetSpecializationsService = {
  getSpecializations: async (): Promise<SpecializationModel[]> => {
    const response = await api.get<SpecializationModel[]>('/specializations');
    return response.data;
  },
};
