import type { MedicalRecord } from '../../../../infrastructure/database/models/medical-record.models';
import type { CreateMedicalRecordDTO } from '../../../../presentation/dto/medicalRecordDTO/create-medical-record.dto';
import type { UpdateMedicalRecordDTO } from '../../../../presentation/dto/medicalRecordDTO/update-medical-record.dto';

export interface IMedicalRecordRepository {
  create(dto: CreateMedicalRecordDTO): Promise<MedicalRecord>;
  findById(id: string): Promise<MedicalRecord | null>;
  findByPatientId(patientId: string): Promise<MedicalRecord[]>;
  findByDoctorId(doctorId: string): Promise<MedicalRecord[]>;
  update(id: string, dto: UpdateMedicalRecordDTO): Promise<MedicalRecord>;
  delete(id: string): Promise<void>;
}
