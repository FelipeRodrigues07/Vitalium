import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { NurseRepository } from '../infrastructure/repositories/nurse/nurse.repository';
import { NurseUnitRepository } from '../infrastructure/repositories/nurse/nurse-unit.repository';
import { NurseController } from '../presentation/controllers/nurse/nurse.controller';
import { NurseUnitController } from '../presentation/controllers/nurse/nurse-unit.controller';
import {
  CreateNurseUseCase,
  SearchNurseUseCase,
  UpdateNurseUseCase,
  DeleteNurseUseCase,
} from '../application/use-cases/nurse/nurse.use-cases';
import {
  CreateNurseUnitUseCase,
  SearchNurseUnitUseCase,
  UpdateNurseUnitUseCase,
  DeleteNurseUnitUseCase,
} from '../application/use-cases/nurse/nurse-unit.use-cases';

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
