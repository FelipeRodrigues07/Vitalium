import { Module } from '@nestjs/common';
import { CreateDoctorUseCase } from '../application/use-cases/doctor/create-doctor.use-case';
import { DeleteDoctorUseCase } from '../application/use-cases/doctor/delete-doctor.use-case';
import { SearchDoctorUseCase } from '../application/use-cases/doctor/search-doctor.use-case';
import { UpdateDoctorUseCase } from '../application/use-cases/doctor/update-doctor.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';
import { UserDataRepository } from '../infrastructure/repositories/user/user-data.repository';
import { DoctorController } from '../presentation/controllers/doctor/doctor.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorController],
  providers: [
    CreateDoctorUseCase,
    SearchDoctorUseCase,
    UpdateDoctorUseCase,
    DeleteDoctorUseCase,

    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserDataRepository,
    },
  ],
})
export class DoctorModule {}
