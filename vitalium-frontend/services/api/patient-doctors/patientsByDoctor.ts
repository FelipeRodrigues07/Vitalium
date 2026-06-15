import { api } from "@/services/api/api";

export interface PatientSummary {
  id: string;
  patientId: string;
  doctorId: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const patientDoctorApi = {
  listPatientsByUserDoctor: (userId: string): Promise<PatientSummary[]> =>
    api
      .get<PatientSummary[]>(`/patient-doctors/doctor/by-user/${userId}`)
      .then((r) => r.data),
};
