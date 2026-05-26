import { Module } from '@nestjs/common';
import { CreatePatientDoctorUseCase } from '../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import {
  DeletePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
} from '../application/use-cases/patient-doctor/patient-doctor.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';
import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
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
    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
  ],
  exports: ['IPatientDoctorRepository'],
})
export class PatientDoctorModule {}
