import { api } from '@/services/api/api';

export interface PatientListUserModel {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface PatientListItemModel {
  id: string;
  userId: string;
  cpf: string;
  birthDate: string;
  gender: string;
  user?: PatientListUserModel;
}

export const GetPatientsService = {
  getMyPatients: async (unitId?: string | null): Promise<PatientListItemModel[]> => {
    const response = await api.get<PatientListItemModel[]>('/patients', {
      params: unitId ? { unitId } : undefined,
    });
    return response.data;
  },
};
