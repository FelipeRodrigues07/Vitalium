import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../application/use-cases/user/create-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/user/delete-user.use-case';
import { SearchUserUseCase } from '../application/use-cases/user/search-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/user/update-user.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { UserDataRepository } from '../infrastructure/repositories/user/user-data.repository';
import { UserController } from '../presentation/controllers/user/user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    { provide: 'IUserRepository', useClass: UserDataRepository },

    CreateUserUseCase,
    SearchUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UserModule {}
