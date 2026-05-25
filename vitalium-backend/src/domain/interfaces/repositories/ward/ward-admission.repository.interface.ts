import type { WardAdmission } from '../../../../infrastructure/database/models/ward-admission.models';
import type { CreateWardAdmissionDTO } from '../../../../presentation/dto/wardAdmissionDTO/create-ward-admission.dto';
import type { UpdateWardAdmissionDTO } from '../../../../presentation/dto/wardAdmissionDTO/update-ward-admission.dto';

export interface IWardAdmissionRepository {
  create(dto: CreateWardAdmissionDTO): Promise<WardAdmission>;
  findById(id: string): Promise<WardAdmission | null>;
  findByPatientId(patientId: string): Promise<WardAdmission[]>;
  findByWardId(wardId: string): Promise<WardAdmission[]>;
  update(id: string, dto: UpdateWardAdmissionDTO): Promise<WardAdmission>;
  delete(id: string): Promise<void>;
}
