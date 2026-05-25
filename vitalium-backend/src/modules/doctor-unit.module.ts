import { Module } from '@nestjs/common';
import { CreateDoctorUnitUseCase } from '../application/use-cases/doctor-unit/create-doctor-unit.use-case';
import { DeleteDoctorUnitUseCase } from '../application/use-cases/doctor-unit/delete-doctor-unit.use-case';
import { UpdateDoctorUnitUseCase } from '../application/use-cases/doctor-unit/update-doctor-unit.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { DoctorRepository } from '../infrastructure/repositories/doctor/doctor.repository';
import { DoctorUnitRepository } from '../infrastructure/repositories/doctor-unit/doctor-unit.repository';
import { UnitRepository } from '../infrastructure/repositories/units/unit.repository';
import { DoctorUnitController } from '../presentation/controllers/doctor-unit/doctor-unit.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorUnitController],
  providers: [
    CreateDoctorUnitUseCase,
    UpdateDoctorUnitUseCase,
    DeleteDoctorUnitUseCase,
    {
      provide: 'IDoctorRepository',
      useClass: DoctorRepository,
    },
    {
      provide: 'IDoctorUnitRepository',
      useClass: DoctorUnitRepository,
    },
    {
      provide: 'IUnitRepository',
      useClass: UnitRepository,
    },
  ],
})
export class DoctorUnitModule {}
