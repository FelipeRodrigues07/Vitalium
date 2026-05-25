import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';

import { PatientController } from '../presentation/controllers/patient/patient.controller';

import { CreatePatientUseCase } from '../application/use-cases/patient/create-patient.use-case';
import { SearchPatientUseCase } from '../application/use-cases/patient/search-patient.use-case';
import { UpdatePatientUseCase } from '../application/use-cases/patient/update-patient.use-case';
import { DeletePatientUseCase } from '../application/use-cases/patient/delete-patient.use-case';

import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';
import { UserDataRepository } from '../infrastructure/repositories/user/user-data.repository';
import { UnitRepository } from '../infrastructure/repositories/units/unit.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PatientController],
  providers: [
    CreatePatientUseCase,
    SearchPatientUseCase,
    UpdatePatientUseCase,
    DeletePatientUseCase,

    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserDataRepository,
    },
    {
      provide: 'IUnitRepository',
      useClass: UnitRepository,
    },
  ],
})
export class PatientModule {}
