import { api } from '@/services/api/api';

export interface CreateDoctorUnitPayload {
  doctorId: string;
  unitId: string;
  consultationPrice?: number;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface DoctorUnitModel {
  id: string;
  doctorId: string;
  unitId: string;
  consultationPrice?: number | null;
  isPrimary: boolean;
  isActive: boolean;
}

export const CreateDoctorUnitService = {
  createDoctorUnit: async (
    payload: CreateDoctorUnitPayload,
  ): Promise<DoctorUnitModel> => {
    const response = await api.post<DoctorUnitModel>('/doctor-units', payload);
    return response.data;
  },
};
