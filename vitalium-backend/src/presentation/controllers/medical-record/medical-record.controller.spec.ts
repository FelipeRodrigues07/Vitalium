import { Test, TestingModule } from '@nestjs/testing';
import { CreateMedicalRecordUseCase } from '../../../application/use-cases/medical-record/create-medical-record.use-case';
import { DeleteMedicalRecordUseCase } from '../../../application/use-cases/medical-record/delete-medical-record.use-case';
import { SearchMedicalRecordUseCase } from '../../../application/use-cases/medical-record/search-medical-record.use-case';
import { UpdateMedicalRecordUseCase } from '../../../application/use-cases/medical-record/update-medical-record.use-case';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { RecordType } from '../../../shared/enums/record-type.enum';
import { MedicalRecordNotFoundException } from '../../../shared/execeptions/medical-record/medical-record-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { MedicalRecordController } from './medical-record.controller';

describe('MedicalRecordController', () => {
  let controller: MedicalRecordController;
  let createUseCase: jest.Mocked<CreateMedicalRecordUseCase>;
  let searchUseCase: jest.Mocked<SearchMedicalRecordUseCase>;
  let deleteUseCase: jest.Mocked<DeleteMedicalRecordUseCase>;

  const mockRecord = {
    id: 'record-id-1',
    patientId: 'patient-id-1',
    doctorId: 'doctor-id-1',
    unitId: 'unit-id-1',
    title: 'Consulta de Rotina',
    description: 'Tudo bem',
    symptoms: [],
    recordDate: '2025-01-01',
    recordType: RecordType.CONSULTATION,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordController],
      providers: [
        {
          provide: CreateMedicalRecordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchMedicalRecordUseCase,
          useValue: {
            findById: jest.fn(),
            findByPatientId: jest.fn(),
            findByDoctorId: jest.fn(),
          },
        },
        {
          provide: UpdateMedicalRecordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteMedicalRecordUseCase,
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

    controller = module.get<MedicalRecordController>(MedicalRecordController);
    createUseCase = module.get(CreateMedicalRecordUseCase);
    searchUseCase = module.get(SearchMedicalRecordUseCase);
    deleteUseCase = module.get(DeleteMedicalRecordUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a medical record', async () => {
      createUseCase.execute.mockResolvedValue(mockRecord);
      const result = await controller.create({
        patientId: 'patient-id-1',
        doctorId: 'doctor-id-1',
        unitId: 'unit-id-1',
        title: 'Consulta de Rotina',
        description: 'Tudo bem',
        recordType: RecordType.CONSULTATION,
      });
      expect(result).toBeDefined();
    });
  });

  const adminReq = { user: { sub: 'admin-1', role: 'ADMIN' } } as any;

  describe('findByPatient', () => {
    it('should return records for a patient', async () => {
      searchUseCase.findByPatientId.mockResolvedValue([mockRecord]);
      const result = await controller.findByPatient(
        'patient-id-1',
        undefined,
        adminReq,
      );
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return record by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockRecord);
      expect(
        await controller.findOne('record-id-1', undefined, adminReq),
      ).toBeDefined();
    });

    it('should propagate MedicalRecordNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new MedicalRecordNotFoundException('nonexistent'),
      );
      await expect(
        controller.findOne('nonexistent', undefined, adminReq),
      ).rejects.toThrow(MedicalRecordNotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete record', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(controller.remove('record-id-1')).resolves.toBeUndefined();
    });
  });
});
