import type { DoctorSpecialization } from './doctor-specialization.models';
import type { DoctorUnit } from './doctor-unit.models';
import type { User } from './user.models';

export class Doctor {
  id: string;
  userId: string;
  crm: string;
  crmState: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  user?: User;
  units?: DoctorUnit[];
  specializations?: DoctorSpecialization[];
}
