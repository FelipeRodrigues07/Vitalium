import { Module } from '@nestjs/common';
import {
  CreateCaregiverUseCase,
  DeleteCaregiverUseCase,
  LinkCaregiverUseCase,
  SearchCaregiverUseCase,
  UpdateCaregiverUseCase,
} from '../application/use-cases/caregiver/caregiver.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { CaregiverRepository } from '../infrastructure/repositories/caregiver/caregiver.repository';
import { CaregiverController } from '../presentation/controllers/caregiver/caregiver.controller';

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
