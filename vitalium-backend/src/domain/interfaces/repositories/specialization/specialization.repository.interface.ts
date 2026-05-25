import type { Specialization } from '../../../../infrastructure/database/models/specialization.models';
import type { CreateSpecializationDTO } from '../../../../presentation/dto/specializationDTO/create-specialization.dto';
import type { UpdateSpecializationDTO } from '../../../../presentation/dto/specializationDTO/update-specialization.dto';

export interface ISpecializationRepository {
<<<<<<< HEAD
  create(dto: CreateSpecializationDTO): Promise<Specialization>;
  findById(id: string): Promise<Specialization | null>;
  findByName(name: string): Promise<Specialization | null>;
  findAll(filters?: { isActive?: boolean }): Promise<Specialization[]>;
  update(id: string, dto: UpdateSpecializationDTO): Promise<Specialization>;
=======
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
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  delete(id: string): Promise<void>;
}
