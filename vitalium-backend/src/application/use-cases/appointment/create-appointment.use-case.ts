import { Inject, Injectable } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import type { Appointment } from '../../../infrastructure/database/models/appointment.models';
import type { CreateAppointmentDTO } from '../../../presentation/dto/appointmentDTO/create-appointment.dto';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class CreateAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(dto: CreateAppointmentDTO): Promise<Appointment> {
    try {
      return await this.appointmentRepository.create(dto);
    } catch (error) {
      throw new DatabaseException('criar consulta', error);
    }
  }
}
