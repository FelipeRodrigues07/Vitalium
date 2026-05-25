import { Module } from '@nestjs/common';
import {
  CreateMedicalAttachmentUseCase,
  DeleteMedicalAttachmentUseCase,
  SearchMedicalAttachmentUseCase,
} from '../application/use-cases/medical-attachment/medical-attachment.use-cases';
import { CreateMedicalRecordUseCase } from '../application/use-cases/medical-record/create-medical-record.use-case';
import { DeleteMedicalRecordUseCase } from '../application/use-cases/medical-record/delete-medical-record.use-case';
import { SearchMedicalRecordUseCase } from '../application/use-cases/medical-record/search-medical-record.use-case';
import { UpdateMedicalRecordUseCase } from '../application/use-cases/medical-record/update-medical-record.use-case';
import { PrismaModule } from '../infrastructure/database/prisma.module';
import { MedicalAttachmentRepository } from '../infrastructure/repositories/medical-attachment/medical-attachment.repository';
import { MedicalRecordRepository } from '../infrastructure/repositories/medical-record/medical-record.repository';
import { MedicalAttachmentController } from '../presentation/controllers/medical-record/medical-attachment.controller';
import { MedicalRecordController } from '../presentation/controllers/medical-record/medical-record.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalRecordController, MedicalAttachmentController],
  providers: [
    CreateMedicalRecordUseCase,
    SearchMedicalRecordUseCase,
    UpdateMedicalRecordUseCase,
    DeleteMedicalRecordUseCase,
    {
      provide: 'IMedicalRecordRepository',
      useClass: MedicalRecordRepository,
    },
    CreateMedicalAttachmentUseCase,
    SearchMedicalAttachmentUseCase,
    DeleteMedicalAttachmentUseCase,
    {
      provide: 'IMedicalAttachmentRepository',
      useClass: MedicalAttachmentRepository,
    },
  ],
  exports: ['IMedicalRecordRepository', 'IMedicalAttachmentRepository'],
})
export class MedicalRecordModule {}
