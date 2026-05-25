import type { DoctorSpecialization } from '../../../../infrastructure/database/models/doctor-specialization.models';
import type { CreateDoctorSpecializationDTO } from '../../../../presentation/dto/doctorSpecializationDTO/create-doctor-specialization.dto';

export interface IDoctorSpecializationRepository {
  create(dto: CreateDoctorSpecializationDTO): Promise<DoctorSpecialization>;
  findById(id: string): Promise<DoctorSpecialization | null>;
  findByDoctorId(doctorId: string): Promise<DoctorSpecialization[]>;
  findBySpecializationId(
    specializationId: string,
  ): Promise<DoctorSpecialization[]>;
  delete(id: string): Promise<void>;
}
