import { Test, TestingModule } from '@nestjs/testing';
import type { IMedicalRecordRepository } from '../../../domain/interfaces/repositories/medical-record/medical-record.repository.interface';
import { RecordType } from '../../../shared/enums/record-type.enum';
import { MedicalRecordNotFoundException } from '../../../shared/execeptions/medical-record/medical-record-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { CreateMedicalRecordUseCase } from './create-medical-record.use-case';
import { DeleteMedicalRecordUseCase } from './delete-medical-record.use-case';
import { SearchMedicalRecordUseCase } from './search-medical-record.use-case';
import { UpdateMedicalRecordUseCase } from './update-medical-record.use-case';

const mockMedicalRecord = {
  id: 'record-id-1',
  patientId: 'patient-id-1',
  doctorId: 'doctor-id-1',
  title: 'Consulta de Rotina',
  description: 'Paciente em bom estado geral',
  symptoms: [],
  recordDate: '2025-01-01',
  recordType: RecordType.CONSULTATION,
  isActive: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockRepoValue = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPatientId: jest.fn(),
  findByDoctorId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// ─── CreateMedicalRecordUseCase ──────────────────────────────────────────────

describe('CreateMedicalRecordUseCase', () => {
  let useCase: CreateMedicalRecordUseCase;
  let repo: jest.Mocked<IMedicalRecordRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMedicalRecordUseCase,
        { provide: 'IMedicalRecordRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<CreateMedicalRecordUseCase>(
      CreateMedicalRecordUseCase,
    );
    repo = module.get('IMedicalRecordRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a medical record successfully', async () => {
    repo.create.mockResolvedValue(mockMedicalRecord);

    const result = await useCase.execute({
      patientId: 'patient-id-1',
      doctorId: 'doctor-id-1',
      title: 'Consulta de Rotina',
      description: 'Paciente em bom estado geral',
      recordType: RecordType.CONSULTATION,
    });

    expect(repo.create).toHaveBeenCalled();
    expect(result).toEqual(mockMedicalRecord);
  });

  it('should throw DatabaseException on repository error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

// ─── SearchMedicalRecordUseCase ──────────────────────────────────────────────

describe('SearchMedicalRecordUseCase', () => {
  let useCase: SearchMedicalRecordUseCase;
  let repo: jest.Mocked<IMedicalRecordRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMedicalRecordUseCase,
        { provide: 'IMedicalRecordRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<SearchMedicalRecordUseCase>(
      SearchMedicalRecordUseCase,
    );
    repo = module.get('IMedicalRecordRepository');
  });

  it('should return record by id', async () => {
    repo.findById.mockResolvedValue(mockMedicalRecord);
    const result = await useCase.findById('record-id-1');
    expect(result).toEqual(mockMedicalRecord);
  });

  it('should throw MedicalRecordNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      MedicalRecordNotFoundException,
    );
  });

  it('should return records by patient', async () => {
    repo.findByPatientId.mockResolvedValue([mockMedicalRecord]);
    const result = await useCase.findByPatientId('patient-id-1');
    expect(result).toEqual([mockMedicalRecord]);
  });

  it('should return records by doctor', async () => {
    repo.findByDoctorId.mockResolvedValue([mockMedicalRecord]);
    const result = await useCase.findByDoctorId('doctor-id-1');
    expect(result).toEqual([mockMedicalRecord]);
  });
});

// ─── UpdateMedicalRecordUseCase ──────────────────────────────────────────────

describe('UpdateMedicalRecordUseCase', () => {
  let useCase: UpdateMedicalRecordUseCase;
  let repo: jest.Mocked<IMedicalRecordRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMedicalRecordUseCase,
        { provide: 'IMedicalRecordRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<UpdateMedicalRecordUseCase>(
      UpdateMedicalRecordUseCase,
    );
    repo = module.get('IMedicalRecordRepository');
  });

  it('should update record when found', async () => {
    const updated = { ...mockMedicalRecord, description: 'Atualizado' };
    repo.findById.mockResolvedValue(mockMedicalRecord);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('record-id-1', {
      description: 'Atualizado',
    });
    expect(result.description).toBe('Atualizado');
  });

  it('should throw MedicalRecordNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      MedicalRecordNotFoundException,
    );
  });
});

// ─── DeleteMedicalRecordUseCase ──────────────────────────────────────────────

describe('DeleteMedicalRecordUseCase', () => {
  let useCase: DeleteMedicalRecordUseCase;
  let repo: jest.Mocked<IMedicalRecordRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMedicalRecordUseCase,
        { provide: 'IMedicalRecordRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<DeleteMedicalRecordUseCase>(
      DeleteMedicalRecordUseCase,
    );
    repo = module.get('IMedicalRecordRepository');
  });

  it('should delete record when found', async () => {
    repo.findById.mockResolvedValue(mockMedicalRecord);
    repo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('record-id-1')).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith('record-id-1');
  });

  it('should throw MedicalRecordNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      MedicalRecordNotFoundException,
    );
  });
});
