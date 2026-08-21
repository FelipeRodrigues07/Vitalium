import type { UnitType } from '../../../shared/enums/unit.enum';
import type { DoctorUnit } from './doctor-unit.models';
import type { NurseUnit } from './nouse-unit.models';
import type { PatientUnit } from './patient-unit.models';
import type { SecretaryUnit } from './secretary-unit.models';

export class Unit {
  id: string;
  name: string;
  type: UnitType;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relacionamentos
  doctors?: DoctorUnit[];
  nurses?: NurseUnit[];
  patients?: PatientUnit[];
  secretaries?: SecretaryUnit[];
}
