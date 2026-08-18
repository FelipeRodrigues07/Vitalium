import { Test, TestingModule } from '@nestjs/testing';
import { CreatePrescriptionUseCase } from '../../../application/use-cases/prescription/create-prescription.use-case';
import { DeletePrescriptionUseCase } from '../../../application/use-cases/prescription/delete-prescription.use-case';
import { SearchPrescriptionUseCase } from '../../../application/use-cases/prescription/search-prescription.use-case';
import { UpdatePrescriptionUseCase } from '../../../application/use-cases/prescription/update-prescription.use-case';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { PrescriptionNotFoundException } from '../../../shared/execeptions/prescription/prescription-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { PrescriptionController } from './prescription.controller';

describe('PrescriptionController', () => {
  let controller: PrescriptionController;
  let createUseCase: jest.Mocked<CreatePrescriptionUseCase>;
  let searchUseCase: jest.Mocked<SearchPrescriptionUseCase>;
  let deleteUseCase: jest.Mocked<DeletePrescriptionUseCase>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionController],
      providers: [
        {
          provide: CreatePrescriptionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchPrescriptionUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByDoctorId: jest.fn(),
          },
        },
        {
          provide: UpdatePrescriptionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeletePrescriptionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ClinicMembershipService,
          useValue: {
            resolveDoctorListUnitId: jest.fn(async (_user, unitId) => unitId),
            assertCanAccessUnitRecord: jest.fn().mockResolvedValue(undefined),
            assertDoctorLinkedToUnit: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PrescriptionController>(PrescriptionController);
    createUseCase = module.get(CreatePrescriptionUseCase);
    searchUseCase = module.get(SearchPrescriptionUseCase);
    deleteUseCase = module.get(DeletePrescriptionUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a prescription', async () => {
      createUseCase.execute.mockResolvedValue(mockPrescription);
      const result = await controller.create({
        patientId: 'patient-id-1',
        doctorId: 'doctor-id-1',
        unitId: 'unit-id-1',
        medication: 'Paracetamol',
        dosage: '500mg',
        frequency: '8h',
        duration: '7 dias',
      } as any);
      expect(result).toBeDefined();
    });
  });

  const adminReq = { user: { sub: 'admin-1', role: 'ADMIN' } } as any;

  describe('findByPatient', () => {
    it('should return prescriptions by patient', async () => {
      searchUseCase.findByPatientId.mockResolvedValue([mockPrescription]);
      const result = await controller.findByPatient(
        'patient-id-1',
        undefined,
        adminReq,
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return prescription by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockPrescription);
      const result = await controller.findOne(
        'prescription-id-1',
        undefined,
        adminReq,
      );
      expect(result).toBeDefined();
    });

    it('should propagate PrescriptionNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new PrescriptionNotFoundException('nonexistent'),
      );
      await expect(
        controller.findOne('nonexistent', undefined, adminReq),
      ).rejects.toThrow(PrescriptionNotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete prescription', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('prescription-id-1'),
      ).resolves.toBeUndefined();
    });
  });
});
