import type { AdminRole } from '../enums/admin-role.enum';
import type { Role } from '../enums/role.enum';

export interface AuthJwtPayload {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  adminId?: string;
  adminRole?: AdminRole;
  unitIds?: string[];
}
