import { Test, TestingModule } from '@nestjs/testing';
import { WardController, WardAdmissionController } from './ward.controller';
import {
  CreateWardUseCase,
  SearchWardUseCase,
  UpdateWardUseCase,
  DeleteWardUseCase,
} from '../../../application/use-cases/ward/ward.use-cases';
import {
  CreateWardAdmissionUseCase,
  SearchWardAdmissionUseCase,
  UpdateWardAdmissionUseCase,
  DeleteWardAdmissionUseCase,
} from '../../../application/use-cases/ward/ward-admission.use-cases';
import { WardNotFoundException } from '../../../shared/execeptions/ward/ward-not-found.exception';
import { WardAdmissionNotFoundException } from '../../../shared/execeptions/ward/ward-admission-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { WardType } from '../../../shared/enums/ward-type.enum';
import { AdmissionStatus } from '../../../shared/enums/admission-status.enum';

describe('WardController', () => {
  let controller: WardController;
  let createWardUseCase: jest.Mocked<CreateWardUseCase>;
  let searchWardUseCase: jest.Mocked<SearchWardUseCase>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardController],
      providers: [
        { provide: CreateWardUseCase, useValue: { execute: jest.fn() } },
        {
          provide: SearchWardUseCase,
          useValue: { findById: jest.fn(), findByUnitId: jest.fn() },
        },
        { provide: UpdateWardUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteWardUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<WardController>(WardController);
    createWardUseCase = module.get(CreateWardUseCase);
    searchWardUseCase = module.get(SearchWardUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a ward', async () => {
      createWardUseCase.execute.mockResolvedValue(mockWard);
      const result = await controller.create({
        unitId: 'unit-id-1',
        name: 'UTI Adulto',
        type: WardType.ICU,
        capacity: 10,
      });
      expect(result).toBeDefined();
    });
  });

  describe('findByUnit', () => {
    it('should return wards by unit', async () => {
      searchWardUseCase.findByUnitId.mockResolvedValue([mockWard]);
      const result = await controller.findByUnit('unit-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return ward by id', async () => {
      searchWardUseCase.findById.mockResolvedValue(mockWard);
      expect(await controller.findOne('ward-id-1')).toBeDefined();
    });

    it('should propagate WardNotFoundException', async () => {
      searchWardUseCase.findById.mockRejectedValue(
        new WardNotFoundException('nonexistent'),
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        WardNotFoundException,
      );
    });
  });
});

describe('WardAdmissionController', () => {
  let controller: WardAdmissionController;
  let createUseCase: jest.Mocked<CreateWardAdmissionUseCase>;
  let searchUseCase: jest.Mocked<SearchWardAdmissionUseCase>;
  let deleteUseCase: jest.Mocked<DeleteWardAdmissionUseCase>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WardAdmissionController],
      providers: [
        {
          provide: CreateWardAdmissionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchWardAdmissionUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByWardId: jest.fn(),
          },
        },
        {
          provide: UpdateWardAdmissionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteWardAdmissionUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<WardAdmissionController>(WardAdmissionController);
    createUseCase = module.get(CreateWardAdmissionUseCase);
    searchUseCase = module.get(SearchWardAdmissionUseCase);
    deleteUseCase = module.get(DeleteWardAdmissionUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a ward admission', async () => {
      createUseCase.execute.mockResolvedValue(mockAdmission);
      const result = await controller.create({
        patientId: 'patient-id-1',
        wardId: 'ward-id-1',
        admissionDate: '2025-01-01',
        reason: 'Cirurgia',
      });
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return admission by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockAdmission);
      expect(await controller.findOne('admission-id-1')).toBeDefined();
    });

    it('should propagate WardAdmissionNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new WardAdmissionNotFoundException('nonexistent'),
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        WardAdmissionNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete admission', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('admission-id-1'),
      ).resolves.toBeUndefined();
    });
  });
});
