import type { Nurse } from '../../../../infrastructure/database/models/nurse.models';
import type { CreateNurseDTO } from '../../../../presentation/dto/nurseDTO/create-nurse.dto';
import type { UpdateNurseDTO } from '../../../../presentation/dto/nurseDTO/update-nurse.dto';

export interface INurseRepository {
  create(dto: CreateNurseDTO): Promise<Nurse>;
  findById(id: string): Promise<Nurse | null>;
  findByUserId(userId: string): Promise<Nurse | null>;
  findByCoren(coren: string): Promise<Nurse | null>;
  findAll(filters?: { isActive?: boolean }): Promise<Nurse[]>;
  update(id: string, dto: UpdateNurseDTO): Promise<Nurse>;
  delete(id: string): Promise<void>;
}
