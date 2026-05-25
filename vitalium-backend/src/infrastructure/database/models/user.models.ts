import type { Admin } from './admin.models';
import type { Role } from '../../../shared/enums';
import type { Caregiver } from './caregiver.models';
import type { Doctor } from './doctor.models';
import type { Nurse } from './nurse.models';
import type { Patient } from './patient.models';

export class User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  role: Role;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;

  patient?: Patient;
  doctor?: Doctor;
  nurse?: Nurse;
  caregiver?: Caregiver;
  admin?: Admin;

  /** Preenchido na listagem de pacientes (GET /users) */
  responsibleDoctorName?: string;
  responsibleDoctorCrm?: string;
}
