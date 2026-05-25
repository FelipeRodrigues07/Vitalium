import { Module } from '@nestjs/common';
import {
  CreateWardUseCase,
  DeleteWardUseCase,
  SearchWardUseCase,
  UpdateWardUseCase,
} from '../application/use-cases/ward/ward.use-cases';
import {
  CreateWardAdmissionUseCase,
  DeleteWardAdmissionUseCase,
  SearchWardAdmissionUseCase,
  UpdateWardAdmissionUseCase,
} from '../application/use-cases/ward/ward-admission.use-cases';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { WardRepository } from '../infrastructure/repositories/ward/ward.repository';
import { WardAdmissionRepository } from '../infrastructure/repositories/ward/ward-admission.repository';
import {
  WardAdmissionController,
  WardController,
} from '../presentation/controllers/ward/ward.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WardController, WardAdmissionController],
  providers: [
    CreateWardUseCase,
    SearchWardUseCase,
    UpdateWardUseCase,
    DeleteWardUseCase,
    CreateWardAdmissionUseCase,
    SearchWardAdmissionUseCase,
    UpdateWardAdmissionUseCase,
    DeleteWardAdmissionUseCase,
    { provide: 'IWardRepository', useClass: WardRepository },
    { provide: 'IWardAdmissionRepository', useClass: WardAdmissionRepository },
  ],
  exports: ['IWardRepository', 'IWardAdmissionRepository'],
})
export class WardModule {}
