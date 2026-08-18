export class SymptomLog {
  id: string;
  patientId: string;
  unitId: string;
  description: string;
  imageUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
  createdAt: Date;
}
