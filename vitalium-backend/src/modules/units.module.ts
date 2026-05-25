import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { PrismaModule } from '../infrastructure/repositories/database/prisma.module';
import { CreateUnitUseCase } from '../application/use-cases/unit/create-unit.use-case';
import { SearchUnitUseCase } from '../application/use-cases/unit/search-unit.use-case';
import { UpdateUnitUseCase } from '../application/use-cases/unit/update-unit.use-case';
import { DeleteUnitUseCase } from '../application/use-cases/unit/delete-unit.use-case';
import { UnitRepository } from '../infrastructure/repositories/units/unit.repository';
import { UnitController } from '../presentation/controllers/unit/unit.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UnitController],
  providers: [
    CreateUnitUseCase,
    SearchUnitUseCase,
    UpdateUnitUseCase,
    DeleteUnitUseCase,
    {
      provide: 'IUnitRepository',
      useClass: UnitRepository,
    },
  ],
  exports: [CreateUnitUseCase],
})
export class UnitModule {}
