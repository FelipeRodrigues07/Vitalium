import type { PatientDoctor } from '../../../../infrastructure/database/models/patient-doctor.models';
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
}
