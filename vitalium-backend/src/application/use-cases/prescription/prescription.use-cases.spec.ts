import { Test, TestingModule } from '@nestjs/testing';
import type { IPrescriptionRepository } from '../../../domain/interfaces/repositories/prescription/prescription.repository.interface';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { PrescriptionNotFoundException } from '../../../shared/execeptions/prescription/prescription-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { CreatePrescriptionUseCase } from './create-prescription.use-case';
import { DeletePrescriptionUseCase } from './delete-prescription.use-case';
import { SearchPrescriptionUseCase } from './search-prescription.use-case';
import { UpdatePrescriptionUseCase } from './update-prescription.use-case';

const mockPrescription = {
  id: 'prescription-id-1',
  patientId: 'patient-id-1',
  doctorId: 'doctor-id-1',
  unitId: 'unit-id-1',
  medications: [{ name: 'Paracetamol', dosage: '500mg' }],
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

// ─── CreatePrescriptionUseCase ───────────────────────────────────────────────

describe('CreatePrescriptionUseCase', () => {
  let useCase: CreatePrescriptionUseCase;
  let repo: jest.Mocked<IPrescriptionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePrescriptionUseCase,
        {
          provide: ClinicMembershipService,
          useValue: {
            assertDoctorAndPatientInUnit: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: 'IPrescriptionRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<CreatePrescriptionUseCase>(CreatePrescriptionUseCase);
    repo = module.get('IPrescriptionRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a prescription successfully', async () => {
    repo.create.mockResolvedValue(mockPrescription);

    const result = await useCase.execute({
      patientId: 'patient-id-1',
      doctorId: 'doctor-id-1',
      unitId: 'unit-id-1',
      medication: 'Paracetamol',
      dosage: '500mg',
      frequency: '8h',
      duration: '7 dias',
    });

    expect(result).toEqual(mockPrescription);
  });

  it('should throw DatabaseException on repository error', async () => {
    repo.create.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute({} as any)).rejects.toThrow(DatabaseException);
  });
});

// ─── SearchPrescriptionUseCase ───────────────────────────────────────────────

describe('SearchPrescriptionUseCase', () => {
  let useCase: SearchPrescriptionUseCase;
  let repo: jest.Mocked<IPrescriptionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPrescriptionUseCase,
        { provide: 'IPrescriptionRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<SearchPrescriptionUseCase>(SearchPrescriptionUseCase);
    repo = module.get('IPrescriptionRepository');
  });

  it('should return prescription by id', async () => {
    repo.findById.mockResolvedValue(mockPrescription);
    const result = await useCase.findById('prescription-id-1');
    expect(result).toEqual(mockPrescription);
  });

  it('should throw PrescriptionNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.findById('nonexistent')).rejects.toThrow(
      PrescriptionNotFoundException,
    );
  });

  it('should return prescriptions by patient', async () => {
    repo.findByPatientId.mockResolvedValue([mockPrescription]);
    const result = await useCase.findByPatientId('patient-id-1');
    expect(result).toEqual([mockPrescription]);
  });

  it('should return prescriptions by doctor', async () => {
    repo.findByDoctorId.mockResolvedValue([mockPrescription]);
    const result = await useCase.findByDoctorId('doctor-id-1');
    expect(result).toEqual([mockPrescription]);
  });
});

// ─── UpdatePrescriptionUseCase ───────────────────────────────────────────────

describe('UpdatePrescriptionUseCase', () => {
  let useCase: UpdatePrescriptionUseCase;
  let repo: jest.Mocked<IPrescriptionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePrescriptionUseCase,
        { provide: 'IPrescriptionRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<UpdatePrescriptionUseCase>(UpdatePrescriptionUseCase);
    repo = module.get('IPrescriptionRepository');
  });

  it('should update prescription when found', async () => {
    const updated = { ...mockPrescription, isActive: false };
    repo.findById.mockResolvedValue(mockPrescription);
    repo.update.mockResolvedValue(updated);

    const result = await useCase.execute('prescription-id-1', {
      isActive: false,
    } as any);
    expect(result).toBeDefined();
  });

  it('should throw PrescriptionNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
      PrescriptionNotFoundException,
    );
  });
});

// ─── DeletePrescriptionUseCase ───────────────────────────────────────────────

describe('DeletePrescriptionUseCase', () => {
  let useCase: DeletePrescriptionUseCase;
  let repo: jest.Mocked<IPrescriptionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePrescriptionUseCase,
        { provide: 'IPrescriptionRepository', useValue: { ...mockRepoValue } },
      ],
    }).compile();

    useCase = module.get<DeletePrescriptionUseCase>(DeletePrescriptionUseCase);
    repo = module.get('IPrescriptionRepository');
  });

  it('should delete prescription when found', async () => {
    repo.findById.mockResolvedValue(mockPrescription);
    repo.delete.mockResolvedValue(undefined);

    await expect(useCase.execute('prescription-id-1')).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith('prescription-id-1');
  });

  it('should throw PrescriptionNotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nonexistent')).rejects.toThrow(
      PrescriptionNotFoundException,
    );
  });
});
