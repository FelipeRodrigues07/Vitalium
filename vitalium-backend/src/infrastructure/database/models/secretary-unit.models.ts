import type { Secretary } from './secretary.models';
import type { Unit } from './unit.models';

export class SecretaryUnit {
  id: string;
  secretaryId: string;
  unitId: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;

  secretary?: Secretary;
  unit?: Unit;
}
