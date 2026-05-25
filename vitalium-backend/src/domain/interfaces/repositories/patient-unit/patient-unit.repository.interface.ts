import type { PatientUnit } from '../../../../infrastructure/database/models/patient-unit.models';
import type { CreatePatientUnitDTO } from '../../../../presentation/dto/patientUnitDTO/create-patient-unit.dto';
import type { UpdatePatientUnitDTO } from '../../../../presentation/dto/patientUnitDTO/update-patient-unit.dto';

export interface IPatientUnitRepository {
  create(dto: CreatePatientUnitDTO): Promise<PatientUnit>;
  findById(id: string): Promise<PatientUnit | null>;
  findByPatientId(patientId: string): Promise<PatientUnit[]>;
  findByUnitId(unitId: string): Promise<PatientUnit[]>;
  findByPatientAndUnit(
    patientId: string,
    unitId: string,
  ): Promise<PatientUnit | null>;
  update(id: string, dto: UpdatePatientUnitDTO): Promise<PatientUnit>;
  delete(id: string): Promise<void>;
}
