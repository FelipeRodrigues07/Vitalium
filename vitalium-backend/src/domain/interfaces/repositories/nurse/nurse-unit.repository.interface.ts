import type { NurseUnit } from '../../../../infrastructure/database/models/nouse-unit.models';
import type { CreateNurseUnitDTO } from '../../../../presentation/dto/nurseUnitDTO/create-nurse-unit.dto';

export interface INurseUnitRepository {
  create(dto: CreateNurseUnitDTO): Promise<NurseUnit>;
  findById(id: string): Promise<NurseUnit | null>;
  findByNurseId(nurseId: string): Promise<NurseUnit[]>;
  findByUnitId(unitId: string): Promise<NurseUnit[]>;
  findAll(filters?: { isActive?: boolean }): Promise<NurseUnit[]>;
  update(id: string, data: Partial<NurseUnit>): Promise<NurseUnit>;
  delete(id: string): Promise<void>;
}
