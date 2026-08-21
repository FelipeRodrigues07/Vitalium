import type { SecretaryUnit } from './secretary-unit.models';
import type { User } from './user.models';

export class Secretary {
  id: string;
  userId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  units?: SecretaryUnit[];
}
