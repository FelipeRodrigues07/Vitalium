import type { Appointment } from '../../../../infrastructure/database/models/appointment.models';
import type { CreateAppointmentDTO } from '../../../../presentation/dto/appointmentDTO/create-appointment.dto';
import type { UpdateAppointmentDTO } from '../../../../presentation/dto/appointmentDTO/update-appointment.dto';

export interface IAppointmentRepository {
  create(dto: CreateAppointmentDTO): Promise<Appointment>;
  findById(id: string): Promise<Appointment | null>;
  findByPatientId(patientId: string, unitId?: string): Promise<Appointment[]>;
  findByDoctorId(doctorId: string, unitId?: string): Promise<Appointment[]>;
  findByUnitId(unitId: string): Promise<Appointment[]>;
  update(id: string, dto: UpdateAppointmentDTO): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
