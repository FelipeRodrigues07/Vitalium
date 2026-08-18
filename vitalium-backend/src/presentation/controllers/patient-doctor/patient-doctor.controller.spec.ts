import { Test, TestingModule } from '@nestjs/testing';
import { CreatePatientDoctorUseCase } from '../../../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import {
  DeletePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
} from '../../../application/use-cases/patient-doctor/patient-doctor.use-cases';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { PatientDoctorNotFoundException } from '../../../shared/execeptions/patient-doctor/patient-doctor-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { PatientDoctorController } from './patient-doctor.controller';

describe('PatientDoctorController', () => {
  let controller: PatientDoctorController;
  let createUseCase: jest.Mocked<CreatePatientDoctorUseCase>;
  let searchUseCase: jest.Mocked<SearchPatientDoctorUseCase>;
  let deleteUseCase: jest.Mocked<DeletePatientDoctorUseCase>;

  const mockLink = {
    id: 'patient-doctor-id-1',
    patientId: 'patient-id-1',
    doctorId: 'doctor-id-1',
    startDate: new Date('2025-01-01'),
    createdAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientDoctorController],
      providers: [
        {
          provide: CreatePatientDoctorUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchPatientDoctorUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByDoctorId: jest.fn(),
          },
        },
        {
          provide: UpdatePatientDoctorUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeletePatientDoctorUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: PrismaProvider,
          useValue: {
            doctor: { findFirst: jest.fn() },
            patient: { findFirst: jest.fn() },
          },
        },
        {
          provide: ClinicMembershipService,
          useValue: {
            resolveDoctorListUnitId: jest.fn(async (_user, unitId) => unitId),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PatientDoctorController>(PatientDoctorController);
    createUseCase = module.get(CreatePatientDoctorUseCase);
    searchUseCase = module.get(SearchPatientDoctorUseCase);
    deleteUseCase = module.get(DeletePatientDoctorUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient-doctor link', async () => {
      createUseCase.execute.mockResolvedValue(mockLink);
      const result = await controller.create(
        { user: { sub: 'admin-user-id', role: 'ADMIN' } } as any,
        {
          patientId: 'patient-id-1',
          doctorId: 'doctor-id-1',
        } as any,
      );
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

  describe('findByDoctor', () => {
    it('should return links by doctor', async () => {
      searchUseCase.findByDoctorId.mockResolvedValue([mockLink]);
      const result = await controller.findByDoctor(
        'doctor-id-1',
        undefined,
        { user: { sub: 'admin-1', role: 'ADMIN' } } as any,
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return link by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockLink);
      expect(await controller.findOne('patient-doctor-id-1')).toBeDefined();
    });

    it('should propagate PatientDoctorNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new PatientDoctorNotFoundException('nonexistent'),
      );
      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        PatientDoctorNotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete link', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('patient-doctor-id-1'),
      ).resolves.toBeUndefined();
    });
  });
});
