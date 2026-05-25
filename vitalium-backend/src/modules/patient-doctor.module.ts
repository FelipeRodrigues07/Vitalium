import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientDoctorController } from '../presentation/controllers/patient-doctor/patient-doctor.controller';
<<<<<<< HEAD
import {
  CreatePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
  DeletePatientDoctorUseCase,
} from '../application/use-cases/patient-doctor/patient-doctor.use-cases';
import { PatientDoctorRepository } from '../infrastructure/repositories/patient-doctor/patient-doctor.repository';
=======
import { CreatePatientDoctorUseCase } from '../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import { PatientDoctorRepository } from '../infrastructure/repositories/patient-doctor/patient-doctor.repository';
import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a

@Module({
  imports: [PrismaModule],
  controllers: [PatientDoctorController],
  providers: [
    CreatePatientDoctorUseCase,
<<<<<<< HEAD
    SearchPatientDoctorUseCase,
    UpdatePatientDoctorUseCase,
    DeletePatientDoctorUseCase,
=======
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
    {
      provide: 'IPatientDoctorRepository',
      useClass: PatientDoctorRepository,
    },
<<<<<<< HEAD
  ],
  exports: ['IPatientDoctorRepository'],
=======
    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
  ],
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
})
export class PatientDoctorModule {}
