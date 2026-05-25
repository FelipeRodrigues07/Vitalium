import type { Specialization } from '../../../../infrastructure/database/models/specialization.models';
import type { CreateSpecializationDTO } from '../../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { UpdateSpecializationDTO } from '../../../../presentation/dto/specializationDTO/update-specialization.dto';

export interface ISpecializationRepository {
  create(dto: CreateSpecializationDTO): Promise<Specialization>;
  findById(id: string): Promise<Specialization | null>;
  findByName(name: string): Promise<Specialization | null>;
  findAll(filters?: { isActive?: boolean }): Promise<Specialization[]>;
  update(id: string, dto: UpdateSpecializationDTO): Promise<Specialization>;
  delete(id: string): Promise<void>;
}
