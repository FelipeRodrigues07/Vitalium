import type { Caregiver } from '../../../../infrastructure/database/models/caregiver.models';
import type { CreateCaregiverDTO } from '../../../../presentation/dto/caregiverDTO/create-caregiver.dto';
import type { UpdateCaregiverDTO } from '../../../../presentation/dto/caregiverDTO/update-caregiver.dto';

export interface ICaregiverRepository {
  create(dto: CreateCaregiverDTO): Promise<Caregiver>;
  findById(id: string): Promise<Caregiver | null>;
  findByCpf(cpf: string): Promise<Caregiver | null>;
  findByUserId(userId: string): Promise<Caregiver | null>;
  findAll(): Promise<Caregiver[]>;
  findByPatientId(patientId: string): Promise<Caregiver[]>;
  update(id: string, dto: UpdateCaregiverDTO): Promise<Caregiver>;
  delete(id: string): Promise<void>;
  linkToPatient(caregiverId: string, patientId: string): Promise<void>;
  unlinkFromPatient(caregiverId: string, patientId: string): Promise<void>;
}
