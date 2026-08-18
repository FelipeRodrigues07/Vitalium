import { Module } from '@nestjs/common';
import { CreateSymptomLogUseCase } from '../application/use-cases/symptom-log/create-symptom-log.use-case';
import { GenerateSymptomMonthlyReportUseCase } from '../application/use-cases/symptom-log/generate-symptom-monthly-report.use-case';
import { ListSymptomLogsUseCase } from '../application/use-cases/symptom-log/list-symptom-logs.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { ClinicMembershipModule } from '../shared/clinic/clinic-membership.module';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';
import { PatientDoctorRepository } from '../infrastructure/repositories/patient-doctor/patient-doctor.repository';
import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
import { SymptomLogRepository } from '../infrastructure/repositories/symptom-log/symptom-log.repository';
import { SymptomImageStorageService } from '../infrastructure/storage/symptom-image.storage';
import { SymptomLogController } from '../presentation/controllers/symptom-log/symptom-log.controller';

@Module({
  imports: [PrismaModule, ClinicMembershipModule],
  controllers: [SymptomLogController],
  providers: [
    SymptomImageStorageService,
    CreateSymptomLogUseCase,
    ListSymptomLogsUseCase,
    GenerateSymptomMonthlyReportUseCase,
    {
      provide: 'ISymptomLogRepository',
      useClass: SymptomLogRepository,
    },
    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
    {
      provide: 'IPatientDoctorRepository',
      useClass: PatientDoctorRepository,
    },
  ],
})
export class SymptomLogModule {}
