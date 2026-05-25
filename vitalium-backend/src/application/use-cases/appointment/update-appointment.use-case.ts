import { Inject, Injectable } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import type { Appointment } from '../../../infrastructure/database/models/appointment.models';
import type { UpdateAppointmentDTO } from '../../../presentation/dto/appointmentDTO/update-appointment.dto';
import { AppointmentNotFoundException } from '../../../shared/execeptions/appointment/appointment-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

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
      return await this.appointmentRepository.update(id, dto);
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) throw error;
      throw new DatabaseException('atualizar consulta', error);
    }
  }
}
