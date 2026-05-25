import { Module } from '@nestjs/common';
import {
  CreatePatientCaregiverUseCase,
  DeactivatePatientCaregiverUseCase,
  DeletePatientCaregiverUseCase,
  SearchPatientCaregiverUseCase,
} from '../application/use-cases/patient-caregiver/patient-caregiver.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientCaregiverRepository } from '../infrastructure/repositories/patient-caregiver/patient-caregiver.repository';
import { PatientCaregiverController } from '../presentation/controllers/patient-caregiver/patient-caregiver.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PatientCaregiverController],
  providers: [
    CreatePatientCaregiverUseCase,
    SearchPatientCaregiverUseCase,
    DeactivatePatientCaregiverUseCase,
    DeletePatientCaregiverUseCase,
    {
      provide: 'IPatientCaregiverRepository',
      useClass: PatientCaregiverRepository,
    },
  ],
  exports: ['IPatientCaregiverRepository'],
})
export class PatientCaregiverModule {}
