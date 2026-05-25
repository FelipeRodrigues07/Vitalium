import type { Specialization } from '../../../../infrastructure/database/models/specialization.models';
import type { CreateSpecializationDTO } from '../../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { UpdateSpecializationDTO } from '../../../../presentation/dto/specializationDTO/update-specialization.dto';

export interface ISpecializationRepository {
  create(
    createSpecializationDTO: CreateSpecializationDTO,
  ): Promise<Specialization>;
  findById(id: string): Promise<Specialization | null>;
  findByName(name: string): Promise<Specialization | null>;
  findAll(): Promise<Specialization[]>;
  update(
    id: string,
    updateSpecializationDTO: UpdateSpecializationDTO,
  ): Promise<Specialization>;
  delete(id: string): Promise<void>;
}
