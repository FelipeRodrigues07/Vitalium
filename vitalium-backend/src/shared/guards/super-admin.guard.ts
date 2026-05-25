import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isSuperAdmin } from '../auth/auth-scope.helper';
import { SUPER_ADMIN_ONLY_KEY } from '../decorators/super-admin.decorator';
import type { AuthJwtPayload } from '../types/auth-jwt-payload.interface';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresSuperAdmin = this.reflector.getAllAndOverride<boolean>(
      SUPER_ADMIN_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresSuperAdmin) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthJwtPayload }>();
    const user = request.user;

    if (!isSuperAdmin(user)) {
      throw new ForbiddenException(
        'Acesso restrito ao super administrador da plataforma',
      );
    }

    return true;
  }
}
