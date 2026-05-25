import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientDoctorController } from '../presentation/controllers/patient-doctor/patient-doctor.controller';
import { CreatePatientDoctorUseCase } from '../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import { PatientDoctorRepository } from '../infrastructure/repositories/patient-doctor/patient-doctor.repository';
import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientDoctorController],
  providers: [
    CreatePatientDoctorUseCase,
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
})
export class PatientDoctorModule {}
