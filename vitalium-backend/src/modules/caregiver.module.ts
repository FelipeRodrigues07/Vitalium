import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { CaregiverController } from '../presentation/controllers/caregiver/caregiver.controller';
import {
  CreateCaregiverUseCase,
  SearchCaregiverUseCase,
  UpdateCaregiverUseCase,
  DeleteCaregiverUseCase,
  LinkCaregiverUseCase,
} from '../application/use-cases/caregiver/caregiver.use-cases';
import { CaregiverRepository } from '../infrastructure/repositories/caregiver/caregiver.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CaregiverController],
  providers: [
    CreateCaregiverUseCase,
    SearchCaregiverUseCase,
    UpdateCaregiverUseCase,
    DeleteCaregiverUseCase,
    LinkCaregiverUseCase,
    {
      provide: 'ICaregiverRepository',
      useClass: CaregiverRepository,
    },
  ],
  exports: ['ICaregiverRepository'],
})
export class CaregiverModule {}
