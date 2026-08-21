import { Module } from '@nestjs/common';
import {
  CreateSecretaryUseCase,
  DeleteSecretaryUseCase,
  SearchSecretaryUseCase,
  UpdateSecretaryUseCase,
} from '../application/use-cases/secretary/secretary.use-cases';
import {
  CreateSecretaryUnitUseCase,
  DeleteSecretaryUnitUseCase,
  SearchSecretaryUnitUseCase,
  UpdateSecretaryUnitUseCase,
} from '../application/use-cases/secretary/secretary-unit.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { SecretaryRepository } from '../infrastructure/repositories/secretary/secretary.repository';
import { SecretaryUnitRepository } from '../infrastructure/repositories/secretary/secretary-unit.repository';
import { SecretaryController } from '../presentation/controllers/secretary/secretary.controller';
import { SecretaryUnitController } from '../presentation/controllers/secretary/secretary-unit.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SecretaryController, SecretaryUnitController],
  providers: [
    CreateSecretaryUseCase,
    SearchSecretaryUseCase,
    UpdateSecretaryUseCase,
    DeleteSecretaryUseCase,
    CreateSecretaryUnitUseCase,
    SearchSecretaryUnitUseCase,
    UpdateSecretaryUnitUseCase,
    DeleteSecretaryUnitUseCase,
    {
      provide: 'ISecretaryRepository',
      useClass: SecretaryRepository,
    },
    {
      provide: 'ISecretaryUnitRepository',
      useClass: SecretaryUnitRepository,
    },
  ],
  exports: ['ISecretaryRepository', 'ISecretaryUnitRepository'],
})
export class SecretaryModule {}
