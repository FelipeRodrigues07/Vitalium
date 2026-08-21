import type { Secretary } from '../../../../infrastructure/database/models/secretary.models';
import type { CreateSecretaryDTO } from '../../../../presentation/dto/secretaryDTO/create-secretary.dto';
import type { UpdateSecretaryDTO } from '../../../../presentation/dto/secretaryDTO/update-secretary.dto';

export interface ISecretaryRepository {
  create(dto: CreateSecretaryDTO): Promise<Secretary>;
  findById(id: string): Promise<Secretary | null>;
  findByUserId(userId: string): Promise<Secretary | null>;
  findAll(filters?: { isActive?: boolean }): Promise<Secretary[]>;
  update(id: string, dto: UpdateSecretaryDTO): Promise<Secretary>;
  delete(id: string): Promise<void>;
  hasActiveUnitLink(secretaryId: string, unitId: string): Promise<boolean>;
}
