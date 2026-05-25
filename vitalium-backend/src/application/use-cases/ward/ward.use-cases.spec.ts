import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateWardUseCase,
  SearchWardUseCase,
  UpdateWardUseCase,
  DeleteWardUseCase,
} from './ward.use-cases';
import {
  CreateWardAdmissionUseCase,
  SearchWardAdmissionUseCase,
  UpdateWardAdmissionUseCase,
  DeleteWardAdmissionUseCase,
} from './ward-admission.use-cases';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { WardNotFoundException } from '../../../shared/execeptions/ward/ward-not-found.exception';
import { WardAdmissionNotFoundException } from '../../../shared/execeptions/ward/ward-admission-not-found.exception';
import type { IWardRepository } from '../../../domain/interfaces/repositories/ward/ward.repository.interface';
import type { IWardAdmissionRepository } from '../../../domain/interfaces/repositories/ward/ward-admission.repository.interface';
import { WardType } from '../../../shared/enums/ward-type.enum';
import { AdmissionStatus } from '../../../shared/enums/admission-status.enum';

const mockWard = {
  id: 'ward-id-1',
  unitId: 'unit-id-1',
  name: 'UTI Adulto',
  wardType: WardType.ICU,
  capacity: 10,
  currentOccupancy: 0,
  isActive: true,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockAdmission = {
  id: 'admission-id-1',
  patientId: 'patient-id-1',
  wardId: 'ward-id-1',
  admissionDate: '2025-01-01',
  reason: 'Cirurgia',
  status: AdmissionStatus.ACTIVE,
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01',
};

const mockWardRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUnitId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAdmissionRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPatientId: jest.fn(),
  findByWardId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// ─── Ward Use Cases ──────────────────────────────────────────────────────────

describe('CreateWardUseCase', () => {
  let useCase: CreateWardUseCase;
  let repo: jest.Mocked<IWardRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWardUseCase,
        { provide: 'IWardRepository', useValue: { ...mockWardRepo } },
      ],
    }).compile();

    useCase = module.get<CreateWardUseCase>(CreateWardUseCase);
    repo = module.get('IWardRepository');
  });

  it('should create a ward successfully', async () => {
    repo.create.mockResolvedValue(mockWard);
    const result = await useCase.execute({
      unitId: 'unit-id-1',
      name: 'UTI Adulto',
      type: WardType.ICU,
      capacity: 10,
    });
    expect(result).toEqual(mockWard);
  });

  it('should throw DatabaseException on error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

describe('SearchWardUseCase', () => {
  let useCase: SearchWardUseCase;
  let repo: jest.Mocked<IWardRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchWardUseCase,
        { provide: 'IWardRepository', useValue: { ...mockWardRepo } },
      ],
    }).compile();

    useCase = module.get<SearchWardUseCase>(SearchWardUseCase);
    repo = module.get('IWardRepository');
  });

  it('should return ward by id', async () => {
    repo.findById.mockResolvedValue(mockWard);
    expect(await useCase.findById('ward-id-1')).toEqual(mockWard);
  });

  it('should throw WardNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      WardNotFoundException,
    );
  });

  it('should return wards by unit', async () => {
    repo.findByUnitId.mockResolvedValue([mockWard]);
    expect(await useCase.findByUnitId('unit-id-1')).toEqual([mockWard]);
  });
});

describe('UpdateWardUseCase', () => {
  let useCase: UpdateWardUseCase;
  let repo: jest.Mocked<IWardRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWardUseCase,
        { provide: 'IWardRepository', useValue: { ...mockWardRepo } },
      ],
    }).compile();

    useCase = module.get<UpdateWardUseCase>(UpdateWardUseCase);
    repo = module.get('IWardRepository');
  });

  it('should update ward when found', async () => {
    const updated = { ...mockWard, capacity: 20 };
    repo.findById.mockResolvedValue(mockWard);
    repo.update.mockResolvedValue(updated);
    expect(
      (await useCase.execute('ward-id-1', { capacity: 20 })).capacity,
    ).toBe(20);
  });

  it('should throw WardNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      WardNotFoundException,
    );
  });
});

describe('DeleteWardUseCase', () => {
  let useCase: DeleteWardUseCase;
  let repo: jest.Mocked<IWardRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteWardUseCase,
        { provide: 'IWardRepository', useValue: { ...mockWardRepo } },
      ],
    }).compile();

    useCase = module.get<DeleteWardUseCase>(DeleteWardUseCase);
    repo = module.get('IWardRepository');
  });

  it('should delete ward when found', async () => {
    repo.findById.mockResolvedValue(mockWard);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('ward-id-1')).resolves.toBeUndefined();
  });

  it('should throw WardNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      WardNotFoundException,
    );
  });
});

// ─── WardAdmission Use Cases ─────────────────────────────────────────────────

describe('CreateWardAdmissionUseCase', () => {
  let useCase: CreateWardAdmissionUseCase;
  let repo: jest.Mocked<IWardAdmissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWardAdmissionUseCase,
        {
          provide: 'IWardAdmissionRepository',
          useValue: { ...mockAdmissionRepo },
        },
      ],
    }).compile();

    useCase = module.get<CreateWardAdmissionUseCase>(
      CreateWardAdmissionUseCase,
    );
    repo = module.get('IWardAdmissionRepository');
  });

  it('should create a ward admission successfully', async () => {
    repo.create.mockResolvedValue(mockAdmission);
    const result = await useCase.execute({
      patientId: 'patient-id-1',
      wardId: 'ward-id-1',
      reason: 'Cirurgia',
    });
    expect(result).toEqual(mockAdmission);
  });
});

describe('SearchWardAdmissionUseCase', () => {
  let useCase: SearchWardAdmissionUseCase;
  let repo: jest.Mocked<IWardAdmissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchWardAdmissionUseCase,
        {
          provide: 'IWardAdmissionRepository',
          useValue: { ...mockAdmissionRepo },
        },
      ],
    }).compile();

    useCase = module.get<SearchWardAdmissionUseCase>(
      SearchWardAdmissionUseCase,
    );
    repo = module.get('IWardAdmissionRepository');
  });

  it('should return admission by id', async () => {
    repo.findById.mockResolvedValue(mockAdmission);
    expect(await useCase.findById('admission-id-1')).toEqual(mockAdmission);
  });

  it('should throw WardAdmissionNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      WardAdmissionNotFoundException,
    );
  });

  it('should return admissions by patient', async () => {
    repo.findByPatientId.mockResolvedValue([mockAdmission]);
    expect(await useCase.findByPatientId('patient-id-1')).toEqual([
      mockAdmission,
    ]);
  });

  it('should return admissions by ward', async () => {
    repo.findByWardId.mockResolvedValue([mockAdmission]);
    expect(await useCase.findByWardId('ward-id-1')).toEqual([mockAdmission]);
  });
});

describe('UpdateWardAdmissionUseCase', () => {
  let useCase: UpdateWardAdmissionUseCase;
  let repo: jest.Mocked<IWardAdmissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWardAdmissionUseCase,
        {
          provide: 'IWardAdmissionRepository',
          useValue: { ...mockAdmissionRepo },
        },
      ],
    }).compile();

    useCase = module.get<UpdateWardAdmissionUseCase>(
      UpdateWardAdmissionUseCase,
    );
    repo = module.get('IWardAdmissionRepository');
  });

  it('should update admission when found', async () => {
    const updated = { ...mockAdmission, status: AdmissionStatus.DISCHARGED };
    repo.findById.mockResolvedValue(mockAdmission);
    repo.update.mockResolvedValue(updated);
    expect(
      (
        await useCase.execute('admission-id-1', {
          status: AdmissionStatus.DISCHARGED,
        })
      ).status,
    ).toBe(AdmissionStatus.DISCHARGED);
  });

  it('should throw WardAdmissionNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      WardAdmissionNotFoundException,
    );
  });
});

describe('DeleteWardAdmissionUseCase', () => {
  let useCase: DeleteWardAdmissionUseCase;
  let repo: jest.Mocked<IWardAdmissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteWardAdmissionUseCase,
        {
          provide: 'IWardAdmissionRepository',
          useValue: { ...mockAdmissionRepo },
        },
      ],
    }).compile();

    useCase = module.get<DeleteWardAdmissionUseCase>(
      DeleteWardAdmissionUseCase,
    );
    repo = module.get('IWardAdmissionRepository');
  });

  it('should delete admission when found', async () => {
    repo.findById.mockResolvedValue(mockAdmission);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('admission-id-1')).resolves.toBeUndefined();
  });

  it('should throw WardAdmissionNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      WardAdmissionNotFoundException,
    );
  });
});
