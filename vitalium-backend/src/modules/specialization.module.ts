import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
<<<<<<< HEAD
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
=======

import { SpecializationController } from '../presentation/controllers/specialization/specialization.controller';

import { CreateSpecializationUseCase } from '../application/use-cases/specialization/create-specialization.use-case';
import { SearchSpecializationUseCase } from '../application/use-cases/specialization/search-specialization.use-case';
import { UpdateSpecializationUseCase } from '../application/use-cases/specialization/update-specialization.use-case';
import { DeleteSpecializationUseCase } from '../application/use-cases/specialization/delete-specialization.use-case';

import { SpecializationRepository } from '../infrastructure/repositories/specialization/specialization.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SpecializationController],
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  providers: [
    CreateSpecializationUseCase,
    SearchSpecializationUseCase,
    UpdateSpecializationUseCase,
    DeleteSpecializationUseCase,
<<<<<<< HEAD
    CreateDoctorSpecializationUseCase,
    SearchDoctorSpecializationUseCase,
    DeleteDoctorSpecializationUseCase,
=======

>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
    {
      provide: 'ISpecializationRepository',
      useClass: SpecializationRepository,
    },
<<<<<<< HEAD
    {
      provide: 'IDoctorSpecializationRepository',
      useClass: DoctorSpecializationRepository,
    },
  ],
  exports: ['ISpecializationRepository', 'IDoctorSpecializationRepository'],
=======
  ],
  exports: [
    {
      provide: 'ISpecializationRepository',
      useClass: SpecializationRepository,
    },
  ],
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
})
export class SpecializationModule {}
