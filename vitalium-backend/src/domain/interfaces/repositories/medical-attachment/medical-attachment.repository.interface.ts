import type { MedicalAttachment } from '../../../../infrastructure/database/models/medical-attachment.models';
import type { CreateMedicalAttachmentDTO } from '../../../../presentation/dto/medicalAttachmentDTO/create-medical-attachment.dto';

export interface IMedicalAttachmentRepository {
  create(dto: CreateMedicalAttachmentDTO): Promise<MedicalAttachment>;
  findById(id: string): Promise<MedicalAttachment | null>;
  findByMedicalRecordId(medicalRecordId: string): Promise<MedicalAttachment[]>;
  delete(id: string): Promise<void>;
}
