import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { SpecializationRepository } from '../infrastructure/repositories/specialization/specialization.repository';
import { DoctorSpecializationRepository } from '../infrastructure/repositories/specialization/doctor-specialization.repository';
import { SpecializationController } from '../presentation/controllers/specialization/specialization.controller';
import { DoctorSpecializationController } from '../presentation/controllers/specialization/doctor-specialization.controller';
import {
  CreateSpecializationUseCase,
  SearchSpecializationUseCase,
  UpdateSpecializationUseCase,
  DeleteSpecializationUseCase,
} from '../application/use-cases/specialization/specialization.use-cases';
import {
  CreateDoctorSpecializationUseCase,
  SearchDoctorSpecializationUseCase,
  DeleteDoctorSpecializationUseCase,
} from '../application/use-cases/specialization/doctor-specialization.use-cases';

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
