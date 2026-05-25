import { Module } from '@nestjs/common';
import { CreateAppointmentUseCase } from '../application/use-cases/appointment/create-appointment.use-case';
import { DeleteAppointmentUseCase } from '../application/use-cases/appointment/delete-appointment.use-case';
import { SearchAppointmentUseCase } from '../application/use-cases/appointment/search-appointment.use-case';
import { UpdateAppointmentUseCase } from '../application/use-cases/appointment/update-appointment.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { AppointmentRepository } from '../infrastructure/repositories/appointment/appointment.repository';
import { AppointmentController } from '../presentation/controllers/appointment/appointment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentController],
  providers: [
    CreateAppointmentUseCase,
    SearchAppointmentUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentUseCase,
    {
      provide: 'IAppointmentRepository',
      useClass: AppointmentRepository,
    },
  ],
  exports: ['IAppointmentRepository'],
})
export class AppointmentModule {}
