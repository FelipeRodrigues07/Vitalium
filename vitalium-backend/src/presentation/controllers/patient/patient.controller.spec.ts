import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { CreatePatientUseCase } from '../../../application/use-cases/patient/create-patient.use-case';
import { SearchPatientUseCase } from '../../../application/use-cases/patient/search-patient.use-case';
import { UpdatePatientUseCase } from '../../../application/use-cases/patient/update-patient.use-case';
import { DeletePatientUseCase } from '../../../application/use-cases/patient/delete-patient.use-case';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { PatientAlreadyExistsException } from '../../../shared/execeptions/patient/patient-already-exists.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

describe('PatientController', () => {
  let controller: PatientController;
  let createPatientUseCase: jest.Mocked<CreatePatientUseCase>;
  let searchPatientUseCase: jest.Mocked<SearchPatientUseCase>;
  let updatePatientUseCase: jest.Mocked<UpdatePatientUseCase>;
  let deletePatientUseCase: jest.Mocked<DeletePatientUseCase>;

  const mockPatient = {
    id: 'patient-id-1',
    userId: 'user-id-1',
    cpf: '12345678901',
    rg: null,
    birthDate: new Date('1990-05-15'),
    gender: 'MALE',
    bloodType: null,
    allergies: null,
    emergencyContact: null,
    emergencyPhone: null,
    address: null,
    city: null,
    state: null,
    zipCode: null,
    whatsappPhone: null,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    units: [],
    patientDoctors: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        { provide: CreatePatientUseCase, useValue: { execute: jest.fn() } },
        {
          provide: SearchPatientUseCase,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findAllForAuthUser: jest.fn(),
          },
        },
        { provide: UpdatePatientUseCase, useValue: { execute: jest.fn() } },
        { provide: DeletePatientUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PatientController>(PatientController);
    createPatientUseCase = module.get(CreatePatientUseCase);
    searchPatientUseCase = module.get(SearchPatientUseCase);
    updatePatientUseCase = module.get(UpdatePatientUseCase);
    deletePatientUseCase = module.get(DeletePatientUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDTO = {
      userId: 'user-id-1',
      cpf: '12345678901',
      birthDate: '1990-05-15',
      gender: 'MALE' as any,
    };

    it('should create a patient successfully', async () => {
      createPatientUseCase.execute.mockResolvedValue(mockPatient);

      const result = await controller.create(createDTO);

      expect(createPatientUseCase.execute).toHaveBeenCalledWith(createDTO);
      expect(result).toBeDefined();
      expect(result.cpf).toBe(mockPatient.cpf);
      expect(result.id).toBe(mockPatient.id);
    });

    it('should propagate PatientAlreadyExistsException for duplicate CPF', async () => {
      createPatientUseCase.execute.mockRejectedValue(
        new PatientAlreadyExistsException('12345678901'),
      );

      await expect(controller.create(createDTO)).rejects.toThrow(
        PatientAlreadyExistsException,
      );
    });

    it('should propagate unexpected errors', async () => {
      createPatientUseCase.execute.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(controller.create(createDTO)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('findOne', () => {
    it('should find a patient by id', async () => {
      searchPatientUseCase.findById.mockResolvedValue(mockPatient);

      const result = await controller.findOne('patient-id-1');

      expect(searchPatientUseCase.findById).toHaveBeenCalledWith(
        'patient-id-1',
      );
      expect(result).toBeDefined();
      expect(result.id).toBe('patient-id-1');
    });

    it('should propagate PatientNotFoundException for non-existent id', async () => {
      searchPatientUseCase.findById.mockRejectedValue(
        new PatientNotFoundException('ID: non-existent'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });

  describe('findAll', () => {
    const mockReq = { user: { id: 'user-id-1', role: 'ADMIN' } } as any;

    it('should return all patients', async () => {
      searchPatientUseCase.findAllForAuthUser.mockResolvedValue([mockPatient]);

      const result = await controller.findAll(mockReq);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockPatient.id);
    });

    it('should propagate PatientNotFoundException when no patients', async () => {
      searchPatientUseCase.findAllForAuthUser.mockRejectedValue(
        new PatientNotFoundException(),
      );

      await expect(controller.findAll(mockReq)).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a patient successfully', async () => {
      const updated = { ...mockPatient, allergies: 'Dipirona' };
      updatePatientUseCase.execute.mockResolvedValue(updated);

      const result = await controller.update('patient-id-1', {
        allergies: 'Dipirona',
      });

      expect(updatePatientUseCase.execute).toHaveBeenCalledWith(
        'patient-id-1',
        { allergies: 'Dipirona' },
      );
      expect(result).toBeDefined();
    });

    it('should propagate PatientNotFoundException on update', async () => {
      updatePatientUseCase.execute.mockRejectedValue(
        new PatientNotFoundException('ID: non-existent'),
      );

      await expect(controller.update('non-existent', {})).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a patient successfully', async () => {
      deletePatientUseCase.execute.mockResolvedValue(undefined);

      await expect(controller.delete('patient-id-1')).resolves.toBeUndefined();
      expect(deletePatientUseCase.execute).toHaveBeenCalledWith('patient-id-1');
    });

    it('should propagate PatientNotFoundException on delete', async () => {
      deletePatientUseCase.execute.mockRejectedValue(
        new PatientNotFoundException('ID: non-existent'),
      );

      await expect(controller.delete('non-existent')).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });
});
