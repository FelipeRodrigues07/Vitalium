import { api } from '@/services/api/api';

export interface CreatePatientDoctorPayload {
  patientId: string;
  doctorId: string;
  unitId?: string;
}

export interface PatientDoctorLinkResponse {
  id: string;
  patientId: string;
  doctorId: string;
  startDate: string;
  endDate?: string | null;
}

export const CreatePatientDoctorService = {
  assign: async (
    payload: CreatePatientDoctorPayload,
  ): Promise<PatientDoctorLinkResponse> => {
    const response = await api.post<PatientDoctorLinkResponse>(
      '/patient-doctors',
      payload,
    );
    return response.data;
  },
};
