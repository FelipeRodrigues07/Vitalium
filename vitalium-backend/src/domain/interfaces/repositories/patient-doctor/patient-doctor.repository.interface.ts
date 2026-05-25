import type { PatientDoctor } from '../../../../infrastructure/database/models/patient-doctor.models';

export interface CreatePatientDoctorData {
  patientId: string;
  doctorId: string;
  startDate?: Date;
}

export interface IPatientDoctorRepository {
  create(data: CreatePatientDoctorData): Promise<PatientDoctor>;
  findActiveByPatientId(patientId: string): Promise<PatientDoctor[]>;
  findByPatientIdAndDoctorId(
    patientId: string,
    doctorId: string,
  ): Promise<PatientDoctor | null>;
  endActiveLinksForPatient(patientId: string, endDate: Date): Promise<void>;
  reactivateLink(id: string, startDate: Date): Promise<PatientDoctor>;
}
