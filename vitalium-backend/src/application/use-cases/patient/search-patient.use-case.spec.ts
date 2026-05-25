import { Test, TestingModule } from '@nestjs/testing';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { SearchPatientUseCase } from './search-patient.use-case';

describe('SearchPatientUseCase', () => {
  let useCase: SearchPatientUseCase;
  let patientRepository: jest.Mocked<IPatientRepository>;

  const mockPatient = {
    id: 'patient-id-1',
    userId: 'user-id-1',
    cpf: '12345678901',
    rg: null,
    birthDate: new Date('1990-05-15'),
    gender: 'MALE',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    units: [],
    patientDoctors: [],
  };

  const patientRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    findAllByDoctorId: jest.fn(),
    findFirstByPatientId: jest.fn(),
    findByWhatsappPhone: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hasActiveUnitLink: jest.fn(),
  };

  const doctorRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCrm: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    findAllByUnitId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    hasActiveUnitLink: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPatientUseCase,
        { provide: 'IPatientRepository', useValue: patientRepositoryMock },
        { provide: 'IDoctorRepository', useValue: doctorRepositoryMock },
      ],
    }).compile();

    useCase = module.get<SearchPatientUseCase>(SearchPatientUseCase);
    patientRepository = module.get('IPatientRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return a patient by id', async () => {
      patientRepository.findById.mockResolvedValue(mockPatient);

      const result = await useCase.findById('patient-id-1');

      expect(patientRepository.findById).toHaveBeenCalledWith('patient-id-1');
      expect(result).toEqual(mockPatient);
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.findById('')).rejects.toThrow(ValidationException);
    });

    it('should throw PatientNotFoundException when patient not found', async () => {
      patientRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent')).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all patients', async () => {
      patientRepository.findAll.mockResolvedValue([mockPatient]);

      const result = await useCase.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockPatient);
    });

    it('should throw PatientNotFoundException when no patients found', async () => {
      patientRepository.findAll.mockResolvedValue([]);

      await expect(useCase.findAll()).rejects.toThrow(PatientNotFoundException);
    });
  });
});
