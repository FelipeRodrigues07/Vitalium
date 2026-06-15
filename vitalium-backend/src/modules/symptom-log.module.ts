import { Module } from '@nestjs/common';
import { CreateSymptomLogUseCase } from '../application/use-cases/symptom-log/create-symptom-log.use-case';
import { ListSymptomLogsUseCase } from '../application/use-cases/symptom-log/list-symptom-logs.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { PatientRepository } from '../infrastructure/repositories/patient/patient.repository';
import { SymptomLogRepository } from '../infrastructure/repositories/symptom-log/symptom-log.repository';
import { SymptomImageStorageService } from '../infrastructure/storage/symptom-image.storage';
import { SymptomLogController } from '../presentation/controllers/symptom-log/symptom-log.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SymptomLogController],
  providers: [
    SymptomImageStorageService,
    CreateSymptomLogUseCase,
    ListSymptomLogsUseCase,
    {
      provide: 'ISymptomLogRepository',
      useClass: SymptomLogRepository,
    },
    {
      provide: 'IPatientRepository',
      useClass: PatientRepository,
    },
  ],
})
export class SymptomLogModule {}
