export class SymptomLog {
  id: string;
  patientId: string;
  description: string;
  imageUrl?: string;
  imageFileName?: string;
  imageMimeType?: string;
  createdAt: Date;
}
