import type { PatientDoctor } from '../../../../infrastructure/database/models/patient-doctor.models';
import { UpdatePatientDoctorDTO } from '../../../../presentation/dto/patientDoctorDTO/update-patient-doctor.dto';

export interface CreatePatientDoctorData {
  patientId: string;
  doctorId: string;
  startDate?: Date;
}

export interface IPatientDoctorRepository {
  create(data: CreatePatientDoctorData): Promise<PatientDoctor>;
  findById(id: string): Promise<PatientDoctor | null>;
  findByPatientId(patientId: string): Promise<PatientDoctor[]>;
  findActiveByPatientId(patientId: string): Promise<PatientDoctor[]>;
  findByDoctorId(doctorId: string): Promise<PatientDoctor[]>;
  findByPatientAndDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<PatientDoctor | null>;
  endActiveLinksForPatient(patientId: string, endDate: Date): Promise<void>;
  reactivateLink(id: string, startDate: Date): Promise<PatientDoctor>;
  update(id: string, dto: UpdatePatientDoctorDTO): Promise<PatientDoctor>;
  delete(id: string): Promise<void>;
}
