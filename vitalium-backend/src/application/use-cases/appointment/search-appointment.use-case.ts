import { Inject, Injectable } from '@nestjs/common';
import type { IAppointmentRepository } from '../../../domain/interfaces/repositories/appointment/appointment.repository.interface';
import type { Appointment } from '../../../infrastructure/database/models/appointment.models';
import { AppointmentNotFoundException } from '../../../shared/execeptions/appointment/appointment-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';

@Injectable()
export class SearchAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async findById(id: string): Promise<Appointment> {
    try {
      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) throw new AppointmentNotFoundException(id);
      return appointment;
    } catch (error) {
      if (error instanceof AppointmentNotFoundException) throw error;
      throw new DatabaseException('buscar consulta', error);
    }
  }

  async findByPatientId(
    patientId: string,
    unitId?: string,
  ): Promise<Appointment[]> {
    try {
      return await this.appointmentRepository.findByPatientId(
        patientId,
        unitId,
      );
    } catch (error) {
      throw new DatabaseException('listar consultas do paciente', error);
    }
  }

  async findByDoctorId(
    doctorId: string,
    unitId?: string,
  ): Promise<Appointment[]> {
    try {
      return await this.appointmentRepository.findByDoctorId(doctorId, unitId);
    } catch (error) {
      throw new DatabaseException('listar consultas do médico', error);
    }
  }

  async findByUnitId(unitId: string): Promise<Appointment[]> {
    try {
      return await this.appointmentRepository.findByUnitId(unitId);
    } catch (error) {
      throw new DatabaseException('listar consultas da unidade', error);
    }
  }
}
