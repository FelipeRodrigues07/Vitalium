import { Test, TestingModule } from '@nestjs/testing';
import {
  SearchCaregiverUseCase,
  UpdateCaregiverUseCase,
  DeleteCaregiverUseCase,
} from './caregiver.use-cases';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { CaregiverNotFoundException } from '../../../shared/execeptions/caregiver/caregiver-not-found.exception';
import type { ICaregiverRepository } from '../../../domain/interfaces/repositories/caregiver/caregiver.repository.interface';
import { CaregiverRelationship } from '../../../shared/enums/caregiver-relationship.enum';

const mockCaregiver = {
  id: 'caregiver-id-1',
  userId: 'user-id-1',
  cpf: '12345678901',
  relationship: CaregiverRelationship.PARENT,
  isActive: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockRepoValue = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCpf: jest.fn(),
  findAll: jest.fn(),
  findByPatientId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  linkToPatient: jest.fn(),
  unlinkFromPatient: jest.fn(),
};

// ─── SearchCaregiverUseCase ──────────────────────────────────────────────────

describe('SearchCaregiverUseCase', () => {
  let useCase: SearchCaregiverUseCase;
  let repo: jest.Mocked<ICaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchCaregiverUseCase,
        { provide: 'ICaregiverRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<SearchCaregiverUseCase>(SearchCaregiverUseCase);
    repo = module.get('ICaregiverRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return caregiver when found', async () => {
      repo.findById.mockResolvedValue(mockCaregiver);
      const result = await useCase.findById('caregiver-id-1');
      expect(result).toEqual(mockCaregiver);
    });

    it('should throw CaregiverNotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.findById('nonexistent')).rejects.toThrow(
        CaregiverNotFoundException,
      );
    });

    it('should throw DatabaseException on repository error', async () => {
      repo.findById.mockRejectedValue(new Error('DB error'));
      await expect(useCase.findById('caregiver-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all caregivers', async () => {
      repo.findAll.mockResolvedValue([mockCaregiver]);
      const result = await useCase.findAll();
      expect(result).toEqual([mockCaregiver]);
    });
  });

  describe('findByPatientId', () => {
    it('should return caregivers for a patient', async () => {
      repo.findByPatientId.mockResolvedValue([mockCaregiver]);
      const result = await useCase.findByPatientId('patient-id-1');
      expect(result).toEqual([mockCaregiver]);
    });
  });
});

// ─── UpdateCaregiverUseCase ──────────────────────────────────────────────────

describe('UpdateCaregiverUseCase', () => {
  let useCase: UpdateCaregiverUseCase;
  let repo: jest.Mocked<ICaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCaregiverUseCase,
        { provide: 'ICaregiverRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<UpdateCaregiverUseCase>(UpdateCaregiverUseCase);
    repo = module.get('ICaregiverRepository');
  });

  it('should update caregiver when found', async () => {
    const updated = {
      ...mockCaregiver,
      relationship: CaregiverRelationship.SIBLING,
    };
    repo.findById.mockResolvedValue(mockCaregiver);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('caregiver-id-1', {
      relationship: CaregiverRelationship.SIBLING,
    });

    expect(result.relationship).toBe(CaregiverRelationship.SIBLING);
  });

  it('should throw CaregiverNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      CaregiverNotFoundException,
    );
  });
});

// ─── DeleteCaregiverUseCase ──────────────────────────────────────────────────

describe('DeleteCaregiverUseCase', () => {
  let useCase: DeleteCaregiverUseCase;
  let repo: jest.Mocked<ICaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCaregiverUseCase,
        { provide: 'ICaregiverRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<DeleteCaregiverUseCase>(DeleteCaregiverUseCase);
    repo = module.get('ICaregiverRepository');
  });

  it('should delete caregiver when found', async () => {
    repo.findById.mockResolvedValue(mockCaregiver);
    repo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('caregiver-id-1')).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith('caregiver-id-1');
  });

  it('should throw CaregiverNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      CaregiverNotFoundException,
    );
  });
});
