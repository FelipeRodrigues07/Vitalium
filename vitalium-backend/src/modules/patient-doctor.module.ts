import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientDoctorController } from '../presentation/controllers/patient-doctor/patient-doctor.controller';
import {
  CreatePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
  DeletePatientDoctorUseCase,
} from '../application/use-cases/patient-doctor/patient-doctor.use-cases';
import { PatientDoctorRepository } from '../infrastructure/repositories/patient-doctor/patient-doctor.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientDoctorController],
  providers: [
    CreatePatientDoctorUseCase,
    SearchPatientDoctorUseCase,
    UpdatePatientDoctorUseCase,
    DeletePatientDoctorUseCase,
    {
      provide: 'IPatientDoctorRepository',
      useClass: PatientDoctorRepository,
    },
  ],
  exports: ['IPatientDoctorRepository'],
})
export class PatientDoctorModule {}
