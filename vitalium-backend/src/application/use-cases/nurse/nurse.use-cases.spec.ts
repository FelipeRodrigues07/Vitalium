import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateNurseUseCase,
  SearchNurseUseCase,
  UpdateNurseUseCase,
  DeleteNurseUseCase,
} from './nurse.use-cases';
import {
  CreateNurseUnitUseCase,
  SearchNurseUnitUseCase,
  UpdateNurseUnitUseCase,
  DeleteNurseUnitUseCase,
} from './nurse-unit.use-cases';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { NurseNotFoundException } from '../../../shared/execeptions/nurse/nurse-not-found.exception';
import { NurseAlreadyExistsException } from '../../../shared/execeptions/nurse/nurse-already-exists.exception';
import { NurseUnitNotFoundException } from '../../../shared/execeptions/nurse/nurse-unit-not-found.exception';
import type { INurseRepository } from '../../../domain/interfaces/repositories/nurse/nurse.repository.interface';
import type { INurseUnitRepository } from '../../../domain/interfaces/repositories/nurse/nurse-unit.repository.interface';

const mockNurse = {
  id: 'nurse-id-1',
  userId: 'user-id-1',
  coren: 'COREN-SP 123456',
  corenState: true,
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockNurseUnit = {
  id: 'nurse-unit-id-1',
  nurseId: 'nurse-id-1',
  unitId: 'unit-id-1',
  isPrimary: true,
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockNurseRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByCoren: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockNurseUnitRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByNurseId: jest.fn(),
  findByUnitId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// ─── Nurse Use Cases ─────────────────────────────────────────────────────────

describe('CreateNurseUseCase', () => {
  let useCase: CreateNurseUseCase;
  let repo: jest.Mocked<INurseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNurseUseCase,
        { provide: 'INurseRepository', useValue: { ...mockNurseRepo } },
      ],
    }).compile();

    useCase = module.get<CreateNurseUseCase>(CreateNurseUseCase);
    repo = module.get('INurseRepository');
  });

  it('should create a nurse successfully', async () => {
    repo.findByCoren.mockResolvedValue(null);
    repo.create.mockResolvedValue(mockNurse);

    const result = await useCase.execute({
      userId: 'user-id-1',
      coren: 'COREN-SP 123456',
      corenState: true,
    });

    expect(repo.findByCoren).toHaveBeenCalledWith('COREN-SP 123456');
    expect(result).toEqual(mockNurse);
  });

  it('should throw NurseAlreadyExistsException when COREN exists', async () => {
    repo.findByCoren.mockResolvedValue(mockNurse);
    await expect(
      useCase.execute({
        userId: 'user-id-1',
        coren: 'COREN-SP 123456',
        corenState: true,
      }),
    ).rejects.toThrow(NurseAlreadyExistsException);
  });

  it('should throw DatabaseException on repository error', async () => {
    repo.findByCoren.mockResolvedValue(null);
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

describe('SearchNurseUseCase', () => {
  let useCase: SearchNurseUseCase;
  let repo: jest.Mocked<INurseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchNurseUseCase,
        { provide: 'INurseRepository', useValue: { ...mockNurseRepo } },
      ],
    }).compile();

    useCase = module.get<SearchNurseUseCase>(SearchNurseUseCase);
    repo = module.get('INurseRepository');
  });

  it('should return nurse by id', async () => {
    repo.findById.mockResolvedValue(mockNurse);
    expect(await useCase.findById('nurse-id-1')).toEqual(mockNurse);
  });

  it('should throw NurseNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      NurseNotFoundException,
    );
  });

  it('should return all nurses', async () => {
    repo.findAll.mockResolvedValue([mockNurse]);
    const result = await useCase.findAll();
    expect(result).toEqual([mockNurse]);
  });
});

describe('UpdateNurseUseCase', () => {
  let useCase: UpdateNurseUseCase;
  let repo: jest.Mocked<INurseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateNurseUseCase,
        { provide: 'INurseRepository', useValue: { ...mockNurseRepo } },
      ],
    }).compile();

    useCase = module.get<UpdateNurseUseCase>(UpdateNurseUseCase);
    repo = module.get('INurseRepository');
  });

  it('should update nurse when found', async () => {
    const updated = { ...mockNurse, isActive: false };
    repo.findById.mockResolvedValue(mockNurse);
    repo.update.mockResolvedValue(updated);
    expect(
      (await useCase.execute('nurse-id-1', { isActive: false })).isActive,
    ).toBe(false);
  });

  it('should throw NurseNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      NurseNotFoundException,
    );
  });
});

describe('DeleteNurseUseCase', () => {
  let useCase: DeleteNurseUseCase;
  let repo: jest.Mocked<INurseRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteNurseUseCase,
        { provide: 'INurseRepository', useValue: { ...mockNurseRepo } },
      ],
    }).compile();

    useCase = module.get<DeleteNurseUseCase>(DeleteNurseUseCase);
    repo = module.get('INurseRepository');
  });

  it('should delete nurse when found', async () => {
    repo.findById.mockResolvedValue(mockNurse);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('nurse-id-1')).resolves.toBeUndefined();
  });

  it('should throw NurseNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NurseNotFoundException,
    );
  });
});

// ─── NurseUnit Use Cases ─────────────────────────────────────────────────────

describe('CreateNurseUnitUseCase', () => {
  let useCase: CreateNurseUnitUseCase;
  let repo: jest.Mocked<INurseUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNurseUnitUseCase,
        { provide: 'INurseUnitRepository', useValue: { ...mockNurseUnitRepo } },
      ],
    }).compile();

    useCase = module.get<CreateNurseUnitUseCase>(CreateNurseUnitUseCase);
    repo = module.get('INurseUnitRepository');
  });

  it('should create a nurse-unit link', async () => {
    repo.create.mockResolvedValue(mockNurseUnit);
    const result = await useCase.execute({
      nurseId: 'nurse-id-1',
      unitId: 'unit-id-1',
    });
    expect(result).toEqual(mockNurseUnit);
  });
});

describe('SearchNurseUnitUseCase', () => {
  let useCase: SearchNurseUnitUseCase;
  let repo: jest.Mocked<INurseUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchNurseUnitUseCase,
        { provide: 'INurseUnitRepository', useValue: { ...mockNurseUnitRepo } },
      ],
    }).compile();

    useCase = module.get<SearchNurseUnitUseCase>(SearchNurseUnitUseCase);
    repo = module.get('INurseUnitRepository');
  });

  it('should return nurse-unit by id', async () => {
    repo.findById.mockResolvedValue(mockNurseUnit);
    expect(await useCase.findById('nurse-unit-id-1')).toEqual(mockNurseUnit);
  });

  it('should throw NurseUnitNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      NurseUnitNotFoundException,
    );
  });

  it('should return links by nurse', async () => {
    repo.findByNurseId.mockResolvedValue([mockNurseUnit]);
    expect(await useCase.findByNurseId('nurse-id-1')).toEqual([mockNurseUnit]);
  });

  it('should return links by unit', async () => {
    repo.findByUnitId.mockResolvedValue([mockNurseUnit]);
    expect(await useCase.findByUnitId('unit-id-1')).toEqual([mockNurseUnit]);
  });
});

describe('UpdateNurseUnitUseCase', () => {
  let useCase: UpdateNurseUnitUseCase;
  let repo: jest.Mocked<INurseUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateNurseUnitUseCase,
        { provide: 'INurseUnitRepository', useValue: { ...mockNurseUnitRepo } },
      ],
    }).compile();

    useCase = module.get<UpdateNurseUnitUseCase>(UpdateNurseUnitUseCase);
    repo = module.get('INurseUnitRepository');
  });

  it('should update nurse-unit when found', async () => {
    const updated = { ...mockNurseUnit, isPrimary: false };
    repo.findById.mockResolvedValue(mockNurseUnit);
    repo.update.mockResolvedValue(updated);
    expect(
      (await useCase.execute('nurse-unit-id-1', { isPrimary: false }))
        .isPrimary,
    ).toBe(false);
  });

  it('should throw NurseUnitNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      NurseUnitNotFoundException,
    );
  });
});

describe('DeleteNurseUnitUseCase', () => {
  let useCase: DeleteNurseUnitUseCase;
  let repo: jest.Mocked<INurseUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteNurseUnitUseCase,
        { provide: 'INurseUnitRepository', useValue: { ...mockNurseUnitRepo } },
      ],
    }).compile();

    useCase = module.get<DeleteNurseUnitUseCase>(DeleteNurseUnitUseCase);
    repo = module.get('INurseUnitRepository');
  });

  it('should delete nurse-unit when found', async () => {
    repo.findById.mockResolvedValue(mockNurseUnit);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('nurse-unit-id-1')).resolves.toBeUndefined();
  });

  it('should throw NurseUnitNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      NurseUnitNotFoundException,
    );
  });
});
