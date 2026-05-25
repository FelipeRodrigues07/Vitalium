import { Module } from '@nestjs/common';
import {
  CreatePatientDoctorUseCase,
  DeletePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
} from '../application/use-cases/patient-doctor/patient-doctor.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientDoctorRepository } from '../infrastructure/repositories/patient-doctor/patient-doctor.repository';
import { PatientDoctorController } from '../presentation/controllers/patient-doctor/patient-doctor.controller';

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
