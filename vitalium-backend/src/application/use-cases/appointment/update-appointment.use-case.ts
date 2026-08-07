import { Inject, Injectable } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import type { Appointment } from '../../../infrastructure/database/models/appointment.models';
import type { UpdateAppointmentDTO } from '../../../presentation/dto/appointmentDTO/update-appointment.dto';
import { AppointmentConflictException } from '../../../shared/execeptions/appointment/appointment-conflict.exception';
import { AppointmentNotFoundException } from '../../../shared/execeptions/appointment/appointment-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { hasDoctorScheduleConflict } from './appointment-conflict.util';

@Injectable()
export class UpdateAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(id: string, dto: UpdateAppointmentDTO): Promise<Appointment> {
    try {
      const existing = await this.appointmentRepository.findById(id);
      if (!existing) throw new AppointmentNotFoundException(id);

      const nextScheduledAt = dto.scheduledAt ?? existing.scheduledAt;
      const nextDuration = dto.duration ?? existing.duration ?? 30;
      const shouldCheckConflict =
        dto.scheduledAt !== undefined || dto.duration !== undefined;

      if (shouldCheckConflict) {
        const doctorAppointments =
          await this.appointmentRepository.findByDoctorId(existing.doctorId);

        if (
          hasDoctorScheduleConflict({
            doctorId: existing.doctorId,
            scheduledAt: nextScheduledAt,
            durationMinutes: nextDuration,
            appointments: doctorAppointments,
            ignoreAppointmentId: id,
          })
        ) {
          throw new AppointmentConflictException(nextScheduledAt);
        }
      }

      return await this.appointmentRepository.update(id, dto);
    } catch (error) {
      if (
        error instanceof AppointmentNotFoundException ||
        error instanceof AppointmentConflictException
      ) {
        throw error;
      }
      throw new DatabaseException('atualizar consulta', error);
    }
  }
}
