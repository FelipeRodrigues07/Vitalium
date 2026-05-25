import type { PatientCaregiver } from '../../../../infrastructure/database/models/patient-caregiver.models';
import type { CreatePatientCaregiverDTO } from '../../../../presentation/dto/patientCaregiverDTO/create-patient-caregiver.dto';

export interface IPatientCaregiverRepository {
  create(dto: CreatePatientCaregiverDTO): Promise<PatientCaregiver>;
  findById(id: string): Promise<PatientCaregiver | null>;
  findByPatientId(patientId: string): Promise<PatientCaregiver[]>;
  findByCaregiverId(caregiverId: string): Promise<PatientCaregiver[]>;
  findByPatientAndCaregiver(
    patientId: string,
    caregiverId: string,
  ): Promise<PatientCaregiver | null>;
  deactivate(id: string): Promise<PatientCaregiver>;
  delete(id: string): Promise<void>;
}
