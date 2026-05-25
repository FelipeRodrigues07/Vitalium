import { Test, TestingModule } from '@nestjs/testing';
import { PatientCaregiverController } from './patient-caregiver.controller';
import {
  CreatePatientCaregiverUseCase,
  SearchPatientCaregiverUseCase,
  DeactivatePatientCaregiverUseCase,
  DeletePatientCaregiverUseCase,
} from '../../../application/use-cases/patient-caregiver/patient-caregiver.use-cases';
import { PatientCaregiverNotFoundException } from '../../../shared/execeptions/patient-caregiver/patient-caregiver-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

describe('PatientCaregiverController', () => {
  let controller: PatientCaregiverController;
  let createUseCase: jest.Mocked<CreatePatientCaregiverUseCase>;
  let searchUseCase: jest.Mocked<SearchPatientCaregiverUseCase>;
  let deactivateUseCase: jest.Mocked<DeactivatePatientCaregiverUseCase>;
  let deleteUseCase: jest.Mocked<DeletePatientCaregiverUseCase>;

  const mockLink = {
    id: 'patient-caregiver-id-1',
    patientId: 'patient-id-1',
    caregiverId: 'caregiver-id-1',
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientCaregiverController],
      providers: [
        {
          provide: CreatePatientCaregiverUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchPatientCaregiverUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByCaregiverId: jest.fn(),
          },
        },
        {
          provide: DeactivatePatientCaregiverUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeletePatientCaregiverUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PatientCaregiverController>(
      PatientCaregiverController,
    );
    createUseCase = module.get(CreatePatientCaregiverUseCase);
    searchUseCase = module.get(SearchPatientCaregiverUseCase);
    deactivateUseCase = module.get(DeactivatePatientCaregiverUseCase);
    deleteUseCase = module.get(DeletePatientCaregiverUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient-caregiver link', async () => {
      createUseCase.execute.mockResolvedValue(mockLink);
      const result = await controller.create({
        patientId: 'patient-id-1',
        caregiverId: 'caregiver-id-1',
      });
      expect(result).toBeDefined();
    });
  });

  describe('findByPatient', () => {
    it('should return links by patient', async () => {
      searchUseCase.findByPatientId.mockResolvedValue([mockLink]);
      const result = await controller.findByPatient('patient-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findByCaregiver', () => {
    it('should return links by caregiver', async () => {
      searchUseCase.findByCaregiverId.mockResolvedValue([mockLink]);
      const result = await controller.findByCaregiver('caregiver-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return link by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockLink);
      expect(await controller.findOne('patient-caregiver-id-1')).toBeDefined();
    });

    it('should propagate PatientCaregiverNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new PatientCaregiverNotFoundException('nonexistent'),
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        PatientCaregiverNotFoundException,
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate link', async () => {
      deactivateUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.deactivate('patient-caregiver-id-1'),
      ).resolves.toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should delete link', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('patient-caregiver-id-1'),
      ).resolves.toBeUndefined();
    });
  });
});
