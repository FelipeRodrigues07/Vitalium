import { Module } from '@nestjs/common';
import { CreateDoctorSpecializationUseCase } from '../application/use-cases/doctor-specialization/create-doctor-specialization.use-case';
import { DeleteDoctorSpecializationUseCase } from '../application/use-cases/doctor-specialization/delete-doctor-specialization.use-case';
import { SearchDoctorSpecializationUseCase } from '../application/use-cases/doctor-specialization/search-doctor-specialization.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';

import { DoctorSpecializationRepository } from '../infrastructure/repositories/doctor-specialization/doctor-specialization.repository';
import { SpecializationRepository } from '../infrastructure/repositories/specialization/specialization.repository';
import { DoctorSpecializationController } from '../presentation/controllers/doctor-specialization/doctor-specialization.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorSpecializationController],
  providers: [
    CreateDoctorSpecializationUseCase,
    SearchDoctorSpecializationUseCase,
    DeleteDoctorSpecializationUseCase,

    {
      provide: 'IDoctorSpecializationRepository',
      useClass: DoctorSpecializationRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
    {
      provide: 'ISpecializationRepository',
      useClass: SpecializationRepository,
    },
  ],
})
export class DoctorSpecializationModule {}
