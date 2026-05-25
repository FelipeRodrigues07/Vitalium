import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { DoctorAlreadyExistsException } from '../../../shared/execeptions/doctor/doctor-already-exists.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { CreateDoctorUseCase } from './create-doctor.use-case';

describe('CreateDoctorUseCase', () => {
  let useCase: CreateDoctorUseCase;
  let doctorRepository: jest.Mocked<IDoctorRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'user-id-1',
    email: 'doctor@example.com',
    password: 'hashedPassword123',
    firstName: 'Dr. João',
    lastName: 'Silva',
    isActive: true,
    role: Role.DOCTOR,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockDoctor = {
    id: 'doctor-id-1',
    userId: 'user-id-1',
    crm: 'CRM123456-SP',
    crmState: 'true',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDoctorUseCase,
        {
          provide: 'IDoctorRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCrm: jest.fn(),
            findByUserId: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'IUserRepository',
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateDoctorUseCase>(CreateDoctorUseCase);
    doctorRepository = module.get('IDoctorRepository');
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      crm: 'CRM123456-SP',
      crmState: true,
      isActive: true,
      userId: 'user-id-1',
    };

    it('should create a doctor successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      doctorRepository.findByCrm.mockResolvedValue(null);
      doctorRepository.findByUserId.mockResolvedValue(null);
      doctorRepository.create.mockResolvedValue(mockDoctor);

      const result = await useCase.execute(validDTO);

      expect(userRepository.findById).toHaveBeenCalledWith(validDTO.userId);
      expect(doctorRepository.findByCrm).toHaveBeenCalledWith(validDTO.crm);
      expect(doctorRepository.findByUserId).toHaveBeenCalledWith(
        validDTO.userId,
      );
      expect(result).toEqual(mockDoctor);
    });

    it('should throw ValidationException when CRM is missing', async () => {
      const dto = { ...validDTO, crm: '' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw ValidationException when user role is not DOCTOR', async () => {
      const nonDoctorUser = { ...mockUser, role: Role.PATIENT };
      userRepository.findById.mockResolvedValue(nonDoctorUser);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw DoctorAlreadyExistsException for duplicate CRM', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      doctorRepository.findByCrm.mockResolvedValue(mockDoctor);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DoctorAlreadyExistsException,
      );
    });

    it('should throw DoctorAlreadyExistsException for duplicate userId', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      doctorRepository.findByCrm.mockResolvedValue(null);
      doctorRepository.findByUserId.mockResolvedValue(mockDoctor);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DoctorAlreadyExistsException,
      );
    });

    it('should throw DatabaseException when repository create fails', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      doctorRepository.findByCrm.mockResolvedValue(null);
      doctorRepository.findByUserId.mockResolvedValue(null);
      doctorRepository.create.mockRejectedValue(
        new Error('DB connection error'),
      );

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
