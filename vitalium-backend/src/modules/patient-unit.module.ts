import { Module } from '@nestjs/common';
import {
  CreatePatientUnitUseCase,
  DeletePatientUnitUseCase,
  SearchPatientUnitUseCase,
  UpdatePatientUnitUseCase,
} from '../application/use-cases/patient-unit/patient-unit.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientUnitRepository } from '../infrastructure/repositories/patient-unit/patient-unit.repository';
import { PatientUnitController } from '../presentation/controllers/patient-unit/patient-unit.controller';

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
