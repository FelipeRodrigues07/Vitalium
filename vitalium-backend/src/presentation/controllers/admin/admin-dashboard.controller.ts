import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { GetAdminDashboardUseCase } from '../../../application/use-cases/admin/get-admin-dashboard.use-case';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('admins')
@ApiBearerAuth('JWT-auth')
@Controller('admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDashboardController {
  constructor(
    private readonly getAdminDashboardUseCase: GetAdminDashboardUseCase,
  ) {}

  @Get()
  async getDashboard(
    @Request() req: RequestWithUser,
    @Query('unitId') unitId?: string,
  ) {
    return this.getAdminDashboardUseCase.execute(req.user, unitId);
  }
}
