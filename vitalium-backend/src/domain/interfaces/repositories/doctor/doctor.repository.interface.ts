import type { Doctor } from '../../../../infrastructure/database/models/doctor.models';
import type { CreateDoctorDTO } from '../../../../presentation/dto/doctorDTO/create-doctor.dto';
import type { UpdateDoctorDTO } from '../../../../presentation/dto/doctorDTO/update-doctor.dto';

export interface IDoctorRepository {
  create(data: CreateDoctorDTO): Promise<Doctor>;
  findById(id: string): Promise<Doctor | null>;
  findByCrm(crm: string): Promise<Doctor | null>;
  findByUserId(userId: string): Promise<Doctor | null>;
  findAll(): Promise<Doctor[]>;
  update(id: string, data: UpdateDoctorDTO): Promise<Doctor>;
  delete(id: string): Promise<void>;
  findAllByUnitId(unitId: string): Promise<Doctor[]>;
  hasActiveUnitLink(doctorId: string, unitId: string): Promise<boolean>;
}
