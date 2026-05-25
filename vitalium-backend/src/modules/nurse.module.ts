import { Module } from '@nestjs/common';
import {
  CreateNurseUseCase,
  DeleteNurseUseCase,
  SearchNurseUseCase,
  UpdateNurseUseCase,
} from '../application/use-cases/nurse/nurse.use-cases';
import {
  CreateNurseUnitUseCase,
  DeleteNurseUnitUseCase,
  SearchNurseUnitUseCase,
  UpdateNurseUnitUseCase,
} from '../application/use-cases/nurse/nurse-unit.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { NurseRepository } from '../infrastructure/repositories/nurse/nurse.repository';
import { NurseUnitRepository } from '../infrastructure/repositories/nurse/nurse-unit.repository';
import { NurseController } from '../presentation/controllers/nurse/nurse.controller';
import { NurseUnitController } from '../presentation/controllers/nurse/nurse-unit.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NurseController, NurseUnitController],
  providers: [
    CreateNurseUseCase,
    SearchNurseUseCase,
    UpdateNurseUseCase,
    DeleteNurseUseCase,
    CreateNurseUnitUseCase,
    SearchNurseUnitUseCase,
    UpdateNurseUnitUseCase,
    DeleteNurseUnitUseCase,
    {
      provide: 'INurseRepository',
      useClass: NurseRepository,
    },
    {
      provide: 'INurseUnitRepository',
      useClass: NurseUnitRepository,
    },
  ],
  exports: ['INurseRepository', 'INurseUnitRepository'],
})
export class NurseModule {}
