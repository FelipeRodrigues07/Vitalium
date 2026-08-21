import { Test, TestingModule } from '@nestjs/testing';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { UpdatePatientUseCase } from './update-patient.use-case';

describe('UpdatePatientUseCase', () => {
  let useCase: UpdatePatientUseCase;
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
    findAllByUnitId: jest.fn(),
    findFirstByPatientId: jest.fn(),
    findByWhatsappPhone: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePatientUseCase,
        { provide: 'IPatientRepository', useValue: patientRepositoryMock },
      ],
    }).compile();

    useCase = module.get<UpdatePatientUseCase>(UpdatePatientUseCase);
    patientRepository = module.get('IPatientRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a patient successfully', async () => {
      const updated = { ...mockPatient, allergies: 'Dipirona' };
      patientRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute('patient-id-1', {
        allergies: 'Dipirona',
      });

      expect(patientRepository.update).toHaveBeenCalledWith('patient-id-1', {
        allergies: 'Dipirona',
      });
      expect(result.allergies).toBe('Dipirona');
    });

    it('should throw PatientNotFoundException when patient not found', async () => {
      patientRepository.update.mockRejectedValue(
        new Error('Patient with id non-existent not found'),
      );

      await expect(useCase.execute('non-existent', {})).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });
});
