import { Test, TestingModule } from '@nestjs/testing';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { PatientAlreadyExistsException } from '../../../shared/execeptions/patient/patient-already-exists.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { CreatePatientUseCase } from './create-patient.use-case';

describe('CreatePatientUseCase', () => {
  let useCase: CreatePatientUseCase;
  let patientRepository: jest.Mocked<IPatientRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'user-id-1',
    email: 'patient@example.com',
    password: 'hashedPassword123',
    firstName: 'Maria',
    lastName: 'Silva',
    isActive: true,
    role: Role.PATIENT,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

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

  const userRepositoryMock = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePatientUseCase,
        { provide: 'IPatientRepository', useValue: patientRepositoryMock },
        { provide: 'IUserRepository', useValue: userRepositoryMock },
        { provide: 'IUnitRepository', useValue: { findById: jest.fn() } },
      ],
    }).compile();

    useCase = module.get<CreatePatientUseCase>(CreatePatientUseCase);
    patientRepository = module.get('IPatientRepository');
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      userId: 'user-id-1',
      cpf: '12345678901',
      birthDate: '1990-05-15',
      gender: 'MALE' as any,
    };

    it('should create a patient successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      patientRepository.findByCpf.mockResolvedValue(null);
      patientRepository.findByUserId.mockResolvedValue(null);
      patientRepository.create.mockResolvedValue(mockPatient);

      const result = await useCase.execute(validDTO);

      expect(userRepository.findById).toHaveBeenCalledWith(validDTO.userId);
      expect(patientRepository.findByCpf).toHaveBeenCalledWith(validDTO.cpf);
      expect(patientRepository.findByUserId).toHaveBeenCalledWith(
        validDTO.userId,
      );
      expect(result).toEqual(mockPatient);
    });

    it('should throw ValidationException when cpf is missing', async () => {
      await expect(useCase.execute({ ...validDTO, cpf: '' })).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when birthDate is missing', async () => {
      await expect(
        useCase.execute({ ...validDTO, birthDate: '' }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw UserNotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw ValidationException when user role is not PATIENT', async () => {
      userRepository.findById.mockResolvedValue({
        ...mockUser,
        role: Role.DOCTOR,
      });

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw PatientAlreadyExistsException when CPF already exists', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      patientRepository.findByCpf.mockResolvedValue(mockPatient);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        PatientAlreadyExistsException,
      );
    });

    it('should throw PatientAlreadyExistsException when userId already linked', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      patientRepository.findByCpf.mockResolvedValue(null);
      patientRepository.findByUserId.mockResolvedValue(mockPatient);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        PatientAlreadyExistsException,
      );
    });
  });
});
