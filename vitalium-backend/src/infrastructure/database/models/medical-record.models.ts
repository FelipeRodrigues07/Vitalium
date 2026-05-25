import type { RecordType } from '../../../shared/enums/record-type.enum';
import type { Doctor } from './doctor.models';
import type { MedicalAttachment } from './medical-attachment.models';
import type { Patient } from './patient.models';

export class MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description: string;
  diagnosis?: string;
  symptoms: string[];
  treatment?: string;
  observations?: string;
  recordDate: string;
  recordType: RecordType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (carregados quando necessário)
  patient?: Patient;
  doctor?: Doctor;
  attachments?: MedicalAttachment[];
}
