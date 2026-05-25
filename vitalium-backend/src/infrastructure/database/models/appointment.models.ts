import type { AppointmentStatus } from '../../../shared/enums/appointment-status.enum';
import type { AppointmentType } from '../../../shared/enums/appointment-type.enum';
import type { Doctor } from './doctor.models';
import type { Patient } from './patient.models';
import type { Unit } from './unit.models';

export class Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  unitId?: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  price?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  patient?: Patient;
  doctor?: Doctor;
  unit?: Unit;
}
