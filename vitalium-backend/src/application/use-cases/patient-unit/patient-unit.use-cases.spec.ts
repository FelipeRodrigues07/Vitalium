import { Test, TestingModule } from '@nestjs/testing';
import type { IPatientUnitRepository } from '../../../domain/interfaces/repositories/patient-unit/patient-unit.repository.interface';
import { PatientUnitNotFoundException } from '../../../shared/execeptions/patient-unit/patient-unit-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import {
  CreatePatientUnitUseCase,
  DeletePatientUnitUseCase,
  SearchPatientUnitUseCase,
  UpdatePatientUnitUseCase,
} from './patient-unit.use-cases';

const mockLink = {
  id: 'link-id-1',
  patientId: 'patient-id-1',
  unitId: 'unit-id-1',
  isPrimary: false,
  isActive: true,
  createdAt: new Date('2025-01-01'),
};

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPatientId: jest.fn(),
  findByUnitId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreatePatientUnitUseCase', () => {
  let useCase: CreatePatientUnitUseCase;
  let repo: jest.Mocked<IPatientUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePatientUnitUseCase,
        { provide: 'IPatientUnitRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<CreatePatientUnitUseCase>(CreatePatientUnitUseCase);
    repo = module.get('IPatientUnitRepository');
  });

  it('should create a patient-unit link', async () => {
    repo.create.mockResolvedValue(mockLink);
    const result = await useCase.execute({
      patientId: 'patient-id-1',
      unitId: 'unit-id-1',
    });
    expect(result).toEqual(mockLink);
  });

  it('should throw DatabaseException on error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

describe('SearchPatientUnitUseCase', () => {
  let useCase: SearchPatientUnitUseCase;
  let repo: jest.Mocked<IPatientUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPatientUnitUseCase,
        { provide: 'IPatientUnitRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<SearchPatientUnitUseCase>(SearchPatientUnitUseCase);
    repo = module.get('IPatientUnitRepository');
  });

  it('should return link by id', async () => {
    repo.findById.mockResolvedValue(mockLink);
    expect(await useCase.findById('link-id-1')).toEqual(mockLink);
  });

  it('should throw PatientUnitNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      PatientUnitNotFoundException,
    );
  });

  it('should return links by patient', async () => {
    repo.findByPatientId.mockResolvedValue([mockLink]);
    expect(await useCase.findByPatientId('patient-id-1')).toEqual([mockLink]);
  });

  it('should return links by unit', async () => {
    repo.findByUnitId.mockResolvedValue([mockLink]);
    expect(await useCase.findByUnitId('unit-id-1')).toEqual([mockLink]);
  });
});

describe('UpdatePatientUnitUseCase', () => {
  let useCase: UpdatePatientUnitUseCase;
  let repo: jest.Mocked<IPatientUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePatientUnitUseCase,
        { provide: 'IPatientUnitRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<UpdatePatientUnitUseCase>(UpdatePatientUnitUseCase);
    repo = module.get('IPatientUnitRepository');
  });

  it('should update link when found', async () => {
    const updated = { ...mockLink, isActive: false };
    repo.findById.mockResolvedValue(mockLink);
    repo.update.mockResolvedValue(updated);
    expect(
      (await useCase.execute('link-id-1', { isActive: false })).isActive,
    ).toBe(false);
  });

  it('should throw PatientUnitNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      PatientUnitNotFoundException,
    );
  });
});

describe('DeletePatientUnitUseCase', () => {
  let useCase: DeletePatientUnitUseCase;
  let repo: jest.Mocked<IPatientUnitRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePatientUnitUseCase,
        { provide: 'IPatientUnitRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<DeletePatientUnitUseCase>(DeletePatientUnitUseCase);
    repo = module.get('IPatientUnitRepository');
  });

  it('should delete link when found', async () => {
    repo.findById.mockResolvedValue(mockLink);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('link-id-1')).resolves.toBeUndefined();
  });

  it('should throw PatientUnitNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      PatientUnitNotFoundException,
    );
  });
});
