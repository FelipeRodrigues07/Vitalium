import { Inject, Injectable } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import { AppointmentNotFoundException } from '../../../shared/execeptions/appointment/appointment-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class DeleteAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      const existing = await this.appointmentRepository.findById(id);
      if (!existing) throw new AppointmentNotFoundException(id);
      await this.appointmentRepository.delete(id);
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) throw error;
      throw new DatabaseException('remover consulta', error);
    }
  }
}
