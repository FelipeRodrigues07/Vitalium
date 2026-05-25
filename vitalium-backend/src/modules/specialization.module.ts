import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';

import { SpecializationController } from '../presentation/controllers/specialization/specialization.controller';

import { CreateSpecializationUseCase } from '../application/use-cases/specialization/create-specialization.use-case';
import { SearchSpecializationUseCase } from '../application/use-cases/specialization/search-specialization.use-case';
import { UpdateSpecializationUseCase } from '../application/use-cases/specialization/update-specialization.use-case';
import { DeleteSpecializationUseCase } from '../application/use-cases/specialization/delete-specialization.use-case';

import { SpecializationRepository } from '../infrastructure/repositories/specialization/specialization.repository';

@Module({
  imports: [PrismaModule],
  controllers: [SpecializationController],
  providers: [
    CreateSpecializationUseCase,
    SearchSpecializationUseCase,
    UpdateSpecializationUseCase,
    DeleteSpecializationUseCase,

    {
      provide: 'ISpecializationRepository',
      useClass: SpecializationRepository,
    },
  ],
  exports: [
    {
      provide: 'ISpecializationRepository',
      useClass: SpecializationRepository,
    },
  ],
})
export class SpecializationModule {}
