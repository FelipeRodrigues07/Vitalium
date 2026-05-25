import { api } from '@/services/api/api';

export interface CreateDoctorSpecializationPayload {
  doctorId: string;
  specializationId: string;
}

export const CreateDoctorSpecializationService = {
  create: async (payload: CreateDoctorSpecializationPayload): Promise<void> => {
    await api.post('/doctor-specializations', payload);
  },
};
