import type { Doctor } from './doctor.models';
import type { Patient } from './patient.models';

export class Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: any;
  instructions?: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (carregados quando necessário)
  patient?: Patient;
  doctor?: Doctor;
}
