import { Test, TestingModule } from '@nestjs/testing';
import {
  CreatePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
  DeletePatientDoctorUseCase,
} from './patient-doctor.use-cases';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { PatientDoctorNotFoundException } from '../../../shared/execeptions/patient-doctor/patient-doctor-not-found.exception';
import type { IPatientDoctorRepository } from '../../../domain/interfaces/repositories/patient-doctor/patient-doctor.repository.interface';

const mockPatientDoctor = {
  id: 'pd-id-1',
  patientId: 'patient-id-1',
  doctorId: 'doctor-id-1',
  startDate: new Date('2025-01-01'),
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockRepoValue = {
  create: jest.fn(),
  findById: jest.fn(),
  findByPatientId: jest.fn(),
  findActiveByPatientId: jest.fn(),
  findByDoctorId: jest.fn(),
  findByPatientAndDoctor: jest.fn(),
  endActiveLinksForPatient: jest.fn(),
  reactivateLink: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CreatePatientDoctorUseCase', () => {
  let useCase: CreatePatientDoctorUseCase;
  let repo: jest.Mocked<IPatientDoctorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePatientDoctorUseCase,
        { provide: 'IPatientDoctorRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<CreatePatientDoctorUseCase>(
      CreatePatientDoctorUseCase,
    );
    repo = module.get('IPatientDoctorRepository');
  });

  it('should create a patient-doctor link', async () => {
    repo.create.mockResolvedValue(mockPatientDoctor);
    const result = await useCase.execute({
      patientId: 'patient-id-1',
      doctorId: 'doctor-id-1',
    });
    expect(result).toEqual(mockPatientDoctor);
  });

  it('should throw DatabaseException on error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

describe('SearchPatientDoctorUseCase', () => {
  let useCase: SearchPatientDoctorUseCase;
  let repo: jest.Mocked<IPatientDoctorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPatientDoctorUseCase,
        { provide: 'IPatientDoctorRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<SearchPatientDoctorUseCase>(
      SearchPatientDoctorUseCase,
    );
    repo = module.get('IPatientDoctorRepository');
  });

  it('should return link by id', async () => {
    repo.findById.mockResolvedValue(mockPatientDoctor);
    expect(await useCase.findById('pd-id-1')).toEqual(mockPatientDoctor);
  });

  it('should throw PatientDoctorNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      PatientDoctorNotFoundException,
    );
  });

  it('should return links by patient', async () => {
    repo.findByPatientId.mockResolvedValue([mockPatientDoctor]);
    expect(await useCase.findByPatientId('patient-id-1')).toEqual([
      mockPatientDoctor,
    ]);
  });

  it('should return links by doctor', async () => {
    repo.findByDoctorId.mockResolvedValue([mockPatientDoctor]);
    expect(await useCase.findByDoctorId('doctor-id-1')).toEqual([
      mockPatientDoctor,
    ]);
  });
});

describe('UpdatePatientDoctorUseCase', () => {
  let useCase: UpdatePatientDoctorUseCase;
  let repo: jest.Mocked<IPatientDoctorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePatientDoctorUseCase,
        { provide: 'IPatientDoctorRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<UpdatePatientDoctorUseCase>(
      UpdatePatientDoctorUseCase,
    );
    repo = module.get('IPatientDoctorRepository');
  });

  it('should update link when found', async () => {
    const updated = { ...mockPatientDoctor, endDate: new Date('2026-01-01') };
    repo.findById.mockResolvedValue(mockPatientDoctor);
    repo.update.mockResolvedValue(updated as any);
    const result = await useCase.execute('pd-id-1', { endDate: '2026-01-01' });
    expect(result).toEqual(updated);
  });

  it('should throw PatientDoctorNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      PatientDoctorNotFoundException,
    );
  });
});

describe('DeletePatientDoctorUseCase', () => {
  let useCase: DeletePatientDoctorUseCase;
  let repo: jest.Mocked<IPatientDoctorRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePatientDoctorUseCase,
        { provide: 'IPatientDoctorRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<DeletePatientDoctorUseCase>(
      DeletePatientDoctorUseCase,
    );
    repo = module.get('IPatientDoctorRepository');
  });

  it('should delete link when found', async () => {
    repo.findById.mockResolvedValue(mockPatientDoctor);
    repo.delete.mockResolvedValue(undefined);
    await expect(useCase.execute('pd-id-1')).resolves.toBeUndefined();
  });

  it('should throw PatientDoctorNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      PatientDoctorNotFoundException,
    );
  });
});
