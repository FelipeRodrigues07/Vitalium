import type { PatientDoctor } from '../../../../infrastructure/database/models/patient-doctor.models';
<<<<<<< HEAD
import type { CreatePatientDoctorDTO } from '../../../../presentation/dto/patientDoctorDTO/create-patient-doctor.dto';
import type { UpdatePatientDoctorDTO } from '../../../../presentation/dto/patientDoctorDTO/update-patient-doctor.dto';

export interface IPatientDoctorRepository {
  create(dto: CreatePatientDoctorDTO): Promise<PatientDoctor>;
  findById(id: string): Promise<PatientDoctor | null>;
  findByPatientId(patientId: string): Promise<PatientDoctor[]>;
  findByDoctorId(doctorId: string): Promise<PatientDoctor[]>;
  findByPatientAndDoctor(
    patientId: string,
    doctorId: string,
  ): Promise<PatientDoctor | null>;
  update(id: string, dto: UpdatePatientDoctorDTO): Promise<PatientDoctor>;
  delete(id: string): Promise<void>;
=======

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
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
}
