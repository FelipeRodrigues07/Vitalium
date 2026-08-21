import type { SecretaryUnit } from '../../../../infrastructure/database/models/secretary-unit.models';
import type { CreateSecretaryUnitDTO } from '../../../../presentation/dto/secretaryUnitDTO/create-secretary-unit.dto';
import type { UpdateSecretaryUnitDTO } from '../../../../presentation/dto/secretaryUnitDTO/update-secretary-unit.dto';

export interface ISecretaryUnitRepository {
  create(dto: CreateSecretaryUnitDTO): Promise<SecretaryUnit>;
  findById(id: string): Promise<SecretaryUnit | null>;
  findBySecretaryId(secretaryId: string): Promise<SecretaryUnit[]>;
  findByUnitId(unitId: string): Promise<SecretaryUnit[]>;
  update(id: string, dto: UpdateSecretaryUnitDTO): Promise<SecretaryUnit>;
  delete(id: string): Promise<void>;
}
