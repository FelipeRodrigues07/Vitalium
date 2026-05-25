import { Test, TestingModule } from '@nestjs/testing';
import { PatientUnitController } from './patient-unit.controller';
import {
  CreatePatientUnitUseCase,
  SearchPatientUnitUseCase,
  UpdatePatientUnitUseCase,
  DeletePatientUnitUseCase,
} from '../../../application/use-cases/patient-unit/patient-unit.use-cases';
import { PatientUnitNotFoundException } from '../../../shared/execeptions/patient-unit/patient-unit-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

describe('PatientUnitController', () => {
  let controller: PatientUnitController;
  let createUseCase: jest.Mocked<CreatePatientUnitUseCase>;
  let searchUseCase: jest.Mocked<SearchPatientUnitUseCase>;
  let deleteUseCase: jest.Mocked<DeletePatientUnitUseCase>;

  const mockLink = {
    id: 'patient-unit-id-1',
    patientId: 'patient-id-1',
    unitId: 'unit-id-1',
    isPrimary: false,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientUnitController],
      providers: [
        { provide: CreatePatientUnitUseCase, useValue: { execute: jest.fn() } },
        {
          provide: SearchPatientUnitUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByUnitId: jest.fn(),
          },
        },
        { provide: UpdatePatientUnitUseCase, useValue: { execute: jest.fn() } },
        { provide: DeletePatientUnitUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PatientUnitController>(PatientUnitController);
    createUseCase = module.get(CreatePatientUnitUseCase);
    searchUseCase = module.get(SearchPatientUnitUseCase);
    deleteUseCase = module.get(DeletePatientUnitUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient-unit link', async () => {
      createUseCase.execute.mockResolvedValue(mockLink);
      const result = await controller.create({
        patientId: 'patient-id-1',
        unitId: 'unit-id-1',
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

  describe('findByUnit', () => {
    it('should return links by unit', async () => {
      searchUseCase.findByUnitId.mockResolvedValue([mockLink]);
      const result = await controller.findByUnit('unit-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return link by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockLink);
      expect(await controller.findOne('patient-unit-id-1')).toBeDefined();
    });

    it('should propagate PatientUnitNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new PatientUnitNotFoundException('nonexistent'),
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        PatientUnitNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete link', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('patient-unit-id-1'),
      ).resolves.toBeUndefined();
    });
  });
});
