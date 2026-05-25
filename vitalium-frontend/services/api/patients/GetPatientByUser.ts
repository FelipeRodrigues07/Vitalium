import { api } from '@/services/api/api';

export interface PatientDoctorLinkModel {
  id: string;
  patientId: string;
  doctorId: string;
  startDate: string;
  endDate?: string | null;
  doctor?: {
    id: string;
    userId: string;
    crm: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface PatientProfileModel {
  id: string;
  userId: string;
  cpf: string;
  birthDate: string;
  gender: string;
  patientDoctors?: PatientDoctorLinkModel[];
}

export const GetPatientByUserService = {
  getByUserId: async (userId: string): Promise<PatientProfileModel> => {
    const response = await api.get<PatientProfileModel>(
      `/patients/by-user/${userId}`,
    );
    return response.data;
  },
};
