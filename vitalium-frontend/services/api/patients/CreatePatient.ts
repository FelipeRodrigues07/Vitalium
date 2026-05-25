import { api } from '@/services/api/api';

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER';
export type PatientBloodType =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE';

export interface CreatePatientPayload {
  userId: string;
  cpf: string;
  birthDate: string;
  gender: PatientGender;
  rg?: string;
  bloodType?: PatientBloodType;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  whatsappPhone?: string;
  unitId?: string;
  isPrimary?: boolean;
}

export interface CreatedPatientModel {
  id: string;
  userId: string;
  cpf: string;
}

export const CreatePatientService = {
  createPatient: async (
    payload: CreatePatientPayload,
  ): Promise<CreatedPatientModel> => {
    const response = await api.post<CreatedPatientModel>('/patients', payload);
    return response.data;
  },
};
