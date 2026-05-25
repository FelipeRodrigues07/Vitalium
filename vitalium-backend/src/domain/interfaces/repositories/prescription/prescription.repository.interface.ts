import type { Prescription } from '../../../../infrastructure/database/models/prescription.models';
import type { CreatePrescriptionDTO } from '../../../../presentation/dto/prescriptionDTO/create-prescription.dto';
import type { UpdatePrescriptionDTO } from '../../../../presentation/dto/prescriptionDTO/update-prescription.dto';

export interface IPrescriptionRepository {
  create(dto: CreatePrescriptionDTO): Promise<Prescription>;
  findById(id: string): Promise<Prescription | null>;
  findByPatientId(patientId: string): Promise<Prescription[]>;
  findByDoctorId(doctorId: string): Promise<Prescription[]>;
  update(id: string, dto: UpdatePrescriptionDTO): Promise<Prescription>;
  delete(id: string): Promise<void>;
}
