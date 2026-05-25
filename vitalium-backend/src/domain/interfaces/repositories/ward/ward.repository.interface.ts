import type { Ward } from '../../../../infrastructure/database/models/ward.models';
import type { CreateWardDTO } from '../../../../presentation/dto/wardDTO/create-ward.dto';
import type { UpdateWardDTO } from '../../../../presentation/dto/wardDTO/update-ward.dto';

export interface IWardRepository {
  create(dto: CreateWardDTO): Promise<Ward>;
  findById(id: string): Promise<Ward | null>;
  findByUnitId(unitId: string): Promise<Ward[]>;
  update(id: string, dto: UpdateWardDTO): Promise<Ward>;
  delete(id: string): Promise<void>;
}
