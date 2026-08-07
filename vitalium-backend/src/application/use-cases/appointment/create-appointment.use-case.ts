import { Inject, Injectable } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import type { Appointment } from '../../../infrastructure/database/models/appointment.models';
import type { CreateAppointmentDTO } from '../../../presentation/dto/appointmentDTO/create-appointment.dto';
import { AppointmentConflictException } from '../../../shared/execeptions/appointment/appointment-conflict.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { hasDoctorScheduleConflict } from './appointment-conflict.util';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(dto: CreateAppointmentDTO): Promise<Appointment> {
    try {
      const existing =
        (await this.appointmentRepository.findByDoctorId(dto.doctorId)) ?? [];
      const duration = dto.duration ?? 30;

      if (
        hasDoctorScheduleConflict({
          doctorId: dto.doctorId,
          scheduledAt: dto.scheduledAt,
          durationMinutes: duration,
          appointments: existing,
        })
      ) {
        throw new AppointmentConflictException(dto.scheduledAt);
      }

      return await this.appointmentRepository.create(dto);
    } catch (error) {
      if (error instanceof AppointmentConflictException) throw error;
      throw new DatabaseException('criar consulta', error);
    }
  }
}
