import type { DoctorSpecialization } from '../../../../infrastructure/database/models/doctor-specialization.models';
import type { CreateDoctorSpecializationDTO } from '../../../../presentation/dto/doctor-specializationDTO/create-doctor-specialization.dto';

export interface IDoctorSpecializationRepository {
  create(
    createDoctorSpecializationDTO: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecialization>;
  findById(id: string): Promise<DoctorSpecialization | null>;
  findByDoctorAndSpecialization(
    doctorId: string,
    specializationId: string,
  ): Promise<DoctorSpecialization | null>;
  findByDoctorId(doctorId: string): Promise<DoctorSpecialization[]>;
  findBySpecializationId(
    specializationId: string,
  ): Promise<DoctorSpecialization[]>;
  delete(id: string): Promise<void>;
}
