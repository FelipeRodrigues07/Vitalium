import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientUnitController } from '../presentation/controllers/patient-unit/patient-unit.controller';
import {
  CreatePatientUnitUseCase,
  SearchPatientUnitUseCase,
  UpdatePatientUnitUseCase,
  DeletePatientUnitUseCase,
} from '../application/use-cases/patient-unit/patient-unit.use-cases';
import { PatientUnitRepository } from '../infrastructure/repositories/patient-unit/patient-unit.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientUnitController],
  providers: [
    CreatePatientUnitUseCase,
    SearchPatientUnitUseCase,
    UpdatePatientUnitUseCase,
    DeletePatientUnitUseCase,
    {
      provide: 'IPatientUnitRepository',
      useClass: PatientUnitRepository,
    },
  ],
  exports: ['IPatientUnitRepository'],
})
export class PatientUnitModule {}
