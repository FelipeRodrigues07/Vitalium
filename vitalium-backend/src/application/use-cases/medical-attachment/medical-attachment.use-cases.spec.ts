import { Test, TestingModule } from '@nestjs/testing';
import type { IMedicalAttachmentRepository } from '../../../domain/interfaces/repositories/medical-attachment/medical-attachment.repository.interface';
import { MedicalAttachmentNotFoundException } from '../../../shared/execeptions/medical-attachment/medical-attachment-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  CreateMedicalAttachmentUseCase,
  DeleteMedicalAttachmentUseCase,
  SearchMedicalAttachmentUseCase,
} from './medical-attachment.use-cases';

const mockAttachment = {
  id: 'attachment-id-1',
  medicalRecordId: 'record-id-1',
  fileName: 'exam.pdf',
  fileUrl: 'https://storage/exam.pdf',
  fileType: 'application/pdf',
  fileSize: 1024,
  uploadedAt: '2025-01-01',
};

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByMedicalRecordId: jest.fn(),
  delete: jest.fn(),
};

describe('CreateMedicalAttachmentUseCase', () => {
  let useCase: CreateMedicalAttachmentUseCase;
  let repo: jest.Mocked<IMedicalAttachmentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMedicalAttachmentUseCase,
        { provide: 'IMedicalAttachmentRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<CreateMedicalAttachmentUseCase>(
      CreateMedicalAttachmentUseCase,
    );
    repo = module.get('IMedicalAttachmentRepository');
  });

  it('should create an attachment', async () => {
    repo.create.mockResolvedValue(mockAttachment);
    const result = await useCase.execute({
      medicalRecordId: 'record-id-1',
      fileName: 'exam.pdf',
      fileUrl: 'https://storage/exam.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
    });
    expect(result).toEqual(mockAttachment);
  });

  it('should throw DatabaseException on error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

describe('SearchMedicalAttachmentUseCase', () => {
  let useCase: SearchMedicalAttachmentUseCase;
  let repo: jest.Mocked<IMedicalAttachmentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMedicalAttachmentUseCase,
        { provide: 'IMedicalAttachmentRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<SearchMedicalAttachmentUseCase>(
      SearchMedicalAttachmentUseCase,
    );
    repo = module.get('IMedicalAttachmentRepository');
  });

  it('should return attachment by id', async () => {
    repo.findById.mockResolvedValue(mockAttachment);
    expect(await useCase.findById('attachment-id-1')).toEqual(mockAttachment);
  });

  it('should throw MedicalAttachmentNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      MedicalAttachmentNotFoundException,
    );
  });

  it('should return attachments by medical record', async () => {
    repo.findByMedicalRecordId.mockResolvedValue([mockAttachment]);
    expect(await useCase.findByMedicalRecordId('record-id-1')).toEqual([
      mockAttachment,
    ]);
  });
});

describe('DeleteMedicalAttachmentUseCase', () => {
  let useCase: DeleteMedicalAttachmentUseCase;
  let repo: jest.Mocked<IMedicalAttachmentRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMedicalAttachmentUseCase,
        { provide: 'IMedicalAttachmentRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<DeleteMedicalAttachmentUseCase>(
      DeleteMedicalAttachmentUseCase,
    );
    repo = module.get('IMedicalAttachmentRepository');
  });

  it('should delete attachment when found', async () => {
    repo.findById.mockResolvedValue(mockAttachment);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('attachment-id-1')).resolves.toBeUndefined();
  });

  it('should throw MedicalAttachmentNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      MedicalAttachmentNotFoundException,
    );
  });
});
