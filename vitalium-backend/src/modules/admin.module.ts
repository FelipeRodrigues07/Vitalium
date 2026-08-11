import { Module } from '@nestjs/common';
import { CreateAdminUseCase } from '../application/use-cases/admin/create-admin.use-case';
import { DeleteAdminUseCase } from '../application/use-cases/admin/delete-admin.use-case';
import { GetAdminDashboardUseCase } from '../application/use-cases/admin/get-admin-dashboard.use-case';
import { SearchAdminUseCase } from '../application/use-cases/admin/search-admin.use-case';
import { UpdateAdminUseCase } from '../application/use-cases/admin/update-admin.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { AdminRepository } from '../infrastructure/repositories/admin/admin.repository';
import { UserDataRepository } from '../infrastructure/repositories/user/user-data.repository';
import { AdminController } from '../presentation/controllers/admin/admin.controller';
import { AdminDashboardController } from '../presentation/controllers/admin/admin-dashboard.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController, AdminDashboardController],
  providers: [
    CreateAdminUseCase,
    SearchAdminUseCase,
    UpdateAdminUseCase,
    DeleteAdminUseCase,
    GetAdminDashboardUseCase,
    {
      provide: 'IAdminRepository',
      useClass: AdminRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserDataRepository,
    },
  ],
})
export class AdminModule {}
