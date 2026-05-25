import type { User } from '@prisma/client';
import type { PatientDoctor } from './patient-doctor.models';
import type { PatientUnit } from './patient-unit.models';

export class Patient {
  id: string;
  userId: string;
  cpf: string;
  rg?: string;
  birthDate: Date;
  gender: string;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  units?: PatientUnit[];
  patientDoctors?: PatientDoctor[];
}
