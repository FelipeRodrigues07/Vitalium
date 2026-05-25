import type { Caregiver } from './caregiver.models';
import type { Patient } from './patient.models';

export class PatientCaregiver {
  id: string;
  patientId: string;
  caregiverId: string;
  isActive: boolean;
  createdAt: string;

  // Relacionamentos (carregados quando necessário)
  patient?: Patient;
  caregiver?: Caregiver;
}
