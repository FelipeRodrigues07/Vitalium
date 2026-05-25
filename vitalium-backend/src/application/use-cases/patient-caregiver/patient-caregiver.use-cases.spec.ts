import { Test, TestingModule } from '@nestjs/testing';
import {
  CreatePatientCaregiverUseCase,
  SearchPatientCaregiverUseCase,
  DeactivatePatientCaregiverUseCase,
  DeletePatientCaregiverUseCase,
} from './patient-caregiver.use-cases';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { PatientCaregiverNotFoundException } from '../../../shared/execeptions/patient-caregiver/patient-caregiver-not-found.exception';
import type { IPatientCaregiverRepository } from '../../../domain/interfaces/repositories/patient-caregiver/patient-caregiver.repository.interface';

const mockLink = {
  id: 'link-id-1',
  patientId: 'patient-id-1',
  caregiverId: 'caregiver-id-1',
  isActive: true,
  createdAt: '2025-01-01',
};

const mockRepo = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPatientId: jest.fn(),
  findByCaregiverId: jest.fn(),
  deactivate: jest.fn(),
  delete: jest.fn(),
};

describe('CreatePatientCaregiverUseCase', () => {
  let useCase: CreatePatientCaregiverUseCase;
  let repo: jest.Mocked<IPatientCaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePatientCaregiverUseCase,
        { provide: 'IPatientCaregiverRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<CreatePatientCaregiverUseCase>(
      CreatePatientCaregiverUseCase,
    );
    repo = module.get('IPatientCaregiverRepository');
  });

  it('should create a patient-caregiver link', async () => {
    repo.create.mockResolvedValue(mockLink);
    const result = await useCase.execute({
      patientId: 'patient-id-1',
      caregiverId: 'caregiver-id-1',
    });
    expect(result).toEqual(mockLink);
  });

  it('should throw DatabaseException on error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

describe('SearchPatientCaregiverUseCase', () => {
  let useCase: SearchPatientCaregiverUseCase;
  let repo: jest.Mocked<IPatientCaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPatientCaregiverUseCase,
        { provide: 'IPatientCaregiverRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<SearchPatientCaregiverUseCase>(
      SearchPatientCaregiverUseCase,
    );
    repo = module.get('IPatientCaregiverRepository');
  });

  it('should return link by id', async () => {
    repo.findById.mockResolvedValue(mockLink);
    expect(await useCase.findById('link-id-1')).toEqual(mockLink);
  });

  it('should throw PatientCaregiverNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      PatientCaregiverNotFoundException,
    );
  });

  it('should return links by patient', async () => {
    repo.findByPatientId.mockResolvedValue([mockLink]);
    expect(await useCase.findByPatientId('patient-id-1')).toEqual([mockLink]);
  });

  it('should return links by caregiver', async () => {
    repo.findByCaregiverId.mockResolvedValue([mockLink]);
    expect(await useCase.findByCaregiverId('caregiver-id-1')).toEqual([
      mockLink,
    ]);
  });
});

describe('DeactivatePatientCaregiverUseCase', () => {
  let useCase: DeactivatePatientCaregiverUseCase;
  let repo: jest.Mocked<IPatientCaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivatePatientCaregiverUseCase,
        { provide: 'IPatientCaregiverRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<DeactivatePatientCaregiverUseCase>(
      DeactivatePatientCaregiverUseCase,
    );
    repo = module.get('IPatientCaregiverRepository');
  });

  it('should deactivate link when found', async () => {
    repo.findById.mockResolvedValue(mockLink);
    repo.deactivate.mockResolvedValue(undefined);
    await expect(useCase.execute('link-id-1')).resolves.toBeUndefined();
  });

  it('should throw PatientCaregiverNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      PatientCaregiverNotFoundException,
    );
  });
});

describe('DeletePatientCaregiverUseCase', () => {
  let useCase: DeletePatientCaregiverUseCase;
  let repo: jest.Mocked<IPatientCaregiverRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePatientCaregiverUseCase,
        { provide: 'IPatientCaregiverRepository', useValue: { ...mockRepo } },
      ],
    }).compile();

    useCase = module.get<DeletePatientCaregiverUseCase>(
      DeletePatientCaregiverUseCase,
    );
    repo = module.get('IPatientCaregiverRepository');
  });

  it('should delete link when found', async () => {
    repo.findById.mockResolvedValue(mockLink);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('link-id-1')).resolves.toBeUndefined();
  });

  it('should throw PatientCaregiverNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      PatientCaregiverNotFoundException,
    );
  });
});
