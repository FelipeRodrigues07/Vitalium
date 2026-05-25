import { api } from '@/services/api/api';

export interface DoctorListItemModel {
  id: string;
  userId: string;
  crm: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const GetDoctorsService = {
  getDoctors: async (unitId?: string): Promise<DoctorListItemModel[]> => {
    const response = await api.get<DoctorListItemModel[]>('/doctors', {
      params: unitId ? { unitId } : undefined,
    });
    return response.data;
  },
};
