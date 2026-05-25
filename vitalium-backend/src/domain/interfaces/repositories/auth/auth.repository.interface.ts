import type { AdminRole } from '../../../../shared/enums/admin-role.enum';
import type { User } from '../../../../infrastructure/database/models/user.models';

export interface AuthAdminContext {
  adminId: string;
  adminRole: AdminRole;
  unitIds: string[];
}

export interface IAuthRepository {
  findByEmailWithOutPassword(email: string): Promise<User | null>;
  findByIdWithRefreshToken(id: string): Promise<User | null>;
  findAdminContextByUserId(userId: string): Promise<AuthAdminContext | null>;
  updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    expiresAt: Date | null,
  ): Promise<void>;
  clearRefreshToken(userId: string): Promise<void>;
}
