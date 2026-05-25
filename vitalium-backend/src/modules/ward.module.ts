import { Module } from '@nestjs/common';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import {
  WardController,
  WardAdmissionController,
} from '../presentation/controllers/ward/ward.controller';
import {
  CreateWardUseCase,
  SearchWardUseCase,
  UpdateWardUseCase,
  DeleteWardUseCase,
} from '../application/use-cases/ward/ward.use-cases';
import {
  CreateWardAdmissionUseCase,
  SearchWardAdmissionUseCase,
  UpdateWardAdmissionUseCase,
  DeleteWardAdmissionUseCase,
} from '../application/use-cases/ward/ward-admission.use-cases';
import { WardRepository } from '../infrastructure/repositories/ward/ward.repository';
import { WardAdmissionRepository } from '../infrastructure/repositories/ward/ward-admission.repository';

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
