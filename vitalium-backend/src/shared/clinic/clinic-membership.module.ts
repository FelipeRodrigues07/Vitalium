import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/database/prisma.module';
import { DoctorRepository } from '../../infrastructure/repositories/doctor/doctor.repository';
import { PatientRepository } from '../../infrastructure/repositories/patient/patient.repository';
import { SecretaryRepository } from '../../infrastructure/repositories/secretary/secretary.repository';
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
    {
      provide: 'ISecretaryRepository',
      useClass: SecretaryRepository,
    },
  ],
  exports: [ClinicMembershipService],
})
export class ClinicMembershipModule {}
