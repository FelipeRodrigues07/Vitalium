import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PrismaProvider } from '../../database/prisma.provider';
import type { IMedicalAttachmentRepository } from '../../../domain/interfaces/repositories/medical-attachment/medical-attachment.repository.interface';
import type { CreateMedicalAttachmentDTO } from '../../../presentation/dto/medicalAttachmentDTO/create-medical-attachment.dto';
import { MedicalAttachment } from '../../database/models/medical-attachment.models';

@Injectable()
export class MedicalAttachmentRepository implements IMedicalAttachmentRepository {
  constructor(private readonly prisma: PrismaProvider) {}

  async create(dto: CreateMedicalAttachmentDTO): Promise<MedicalAttachment> {
    const attachment = await this.prisma.medicalAttachment.create({
      data: {
        medicalRecordId: dto.medicalRecordId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        fileType: dto.fileType,
        fileSize: dto.fileSize,
      },
    });
    return plainToInstance(MedicalAttachment, attachment);
  }

  async findById(id: string): Promise<MedicalAttachment | null> {
    const attachment = await this.prisma.medicalAttachment.findUnique({
      where: { id },
    });
    return attachment ? plainToInstance(MedicalAttachment, attachment) : null;
  }

  async findByMedicalRecordId(
    medicalRecordId: string,
  ): Promise<MedicalAttachment[]> {
    const attachments = await this.prisma.medicalAttachment.findMany({
      where: { medicalRecordId },
      orderBy: { uploadedAt: 'desc' },
    });
    return plainToInstance(MedicalAttachment, attachments);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.medicalAttachment.delete({ where: { id } });
  }
}
