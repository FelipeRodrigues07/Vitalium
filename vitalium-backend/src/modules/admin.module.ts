import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { AdminController } from '../presentation/controllers/admin/admin.controller';
import { CreateAdminUseCase } from '../application/use-cases/admin/create-admin.use-case';
import { SearchAdminUseCase } from '../application/use-cases/admin/search-admin.use-case';
import { UpdateAdminUseCase } from '../application/use-cases/admin/update-admin.use-case';
import { DeleteAdminUseCase } from '../application/use-cases/admin/delete-admin.use-case';
import { AdminRepository } from '../infrastructure/repositories/admin/admin.repository';
import { UserDataRepository } from '../infrastructure/repositories/user/user-data.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminController],
  providers: [
    CreateAdminUseCase,
    SearchAdminUseCase,
    UpdateAdminUseCase,
    DeleteAdminUseCase,
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
