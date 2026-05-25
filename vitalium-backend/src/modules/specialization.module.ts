import { Module } from '@nestjs/common';
import {
  CreateDoctorSpecializationUseCase,
  DeleteDoctorSpecializationUseCase,
  SearchDoctorSpecializationUseCase,
} from '../application/use-cases/specialization/doctor-specialization.use-cases';
import {
  CreateSpecializationUseCase,
  DeleteSpecializationUseCase,
  SearchSpecializationUseCase,
  UpdateSpecializationUseCase,
} from '../application/use-cases/specialization/specialization.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { DoctorSpecializationRepository } from '../infrastructure/repositories/specialization/doctor-specialization.repository';
import { SpecializationRepository } from '../infrastructure/repositories/specialization/specialization.repository';
import { DoctorSpecializationController } from '../presentation/controllers/specialization/doctor-specialization.controller';
import { SpecializationController } from '../presentation/controllers/specialization/specialization.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SpecializationController, DoctorSpecializationController],
  providers: [
    CreateSpecializationUseCase,
    SearchSpecializationUseCase,
    UpdateSpecializationUseCase,
    DeleteSpecializationUseCase,
    CreateDoctorSpecializationUseCase,
    SearchDoctorSpecializationUseCase,
    DeleteDoctorSpecializationUseCase,
    {
      provide: 'ISpecializationRepository',
      useClass: SpecializationRepository,
    },
    {
      provide: 'IDoctorSpecializationRepository',
      useClass: DoctorSpecializationRepository,
    },
  ],
  exports: ['ISpecializationRepository', 'IDoctorSpecializationRepository'],
})
export class SpecializationModule {}
