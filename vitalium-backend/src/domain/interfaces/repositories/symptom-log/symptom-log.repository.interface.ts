import type { SymptomLog } from '../../../../infrastructure/database/models/symptom-log.models';

export interface CreateSymptomLogData {
  patientId: string;
  description: string;
  imageUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
}

export interface ISymptomLogRepository {
  create(data: CreateSymptomLogData): Promise<SymptomLog>;
  findByPatientId(patientId: string): Promise<SymptomLog[]>;
}
