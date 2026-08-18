import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { DoctorRepository } from '../../infrastructure/repositories/doctor/doctor.repository';
import { PatientRepository } from '../../infrastructure/repositories/patient/patient.repository';
import { ClinicMembershipService } from './clinic-membership.service';

@Module({
  imports: [PrismaModule],
  providers: [
    ClinicMembershipService,
    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
  ],
  exports: [ClinicMembershipService],
})
export class ClinicMembershipModule {}
