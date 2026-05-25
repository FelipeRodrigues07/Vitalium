import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { CreateDoctorSpecializationUseCase } from './create-doctor-specialization.use-case';

describe('CreateDoctorSpecializationUseCase', () => {
  let useCase: CreateDoctorSpecializationUseCase;
  let doctorSpecializationRepository: jest.Mocked<IDoctorSpecializationRepository>;
  let doctorRepository: jest.Mocked<IDoctorRepository>;
  let specializationRepository: jest.Mocked<ISpecializationRepository>;

  const mockDoctor = {
    id: 'doctor-id-1',
    userId: 'user-id-1',
    crm: '123456-SP',
    crmState: 'true',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockSpecialization = {
    id: 'specialization-id-1',
    name: 'Cardiologia',
    description: 'Especialidade médica',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockDoctorSpecialization = {
    id: 'doctor-specialization-id-1',
    doctorId: 'doctor-id-1',
    specializationId: 'specialization-id-1',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const doctorSpecializationRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByDoctorAndSpecialization: jest.fn(),
    findByDoctorId: jest.fn(),
    findBySpecializationId: jest.fn(),
    delete: jest.fn(),
  };

  const doctorRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCrm: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const specializationRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDoctorSpecializationUseCase,
        {
          provide: 'IDoctorSpecializationRepository',
          useValue: doctorSpecializationRepositoryMock,
        },
        {
          provide: 'IDoctorRepository',
          useValue: doctorRepositoryMock,
        },
        {
          provide: 'ISpecializationRepository',
          useValue: specializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateDoctorSpecializationUseCase>(
      CreateDoctorSpecializationUseCase,
    );
    doctorSpecializationRepository = module.get(
      'IDoctorSpecializationRepository',
    );
    doctorRepository = module.get('IDoctorRepository');
    specializationRepository = module.get('ISpecializationRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      doctorId: 'doctor-id-1',
      specializationId: 'specialization-id-1',
    };

    it('should create a doctor-specialization link successfully', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      specializationRepository.findById.mockResolvedValue(mockSpecialization);
      doctorSpecializationRepository.findByDoctorAndSpecialization.mockResolvedValue(
        null,
      );
      doctorSpecializationRepository.create.mockResolvedValue(
        mockDoctorSpecialization,
      );

      const result = await useCase.execute(validDTO);

      expect(result).toEqual(mockDoctorSpecialization);
      expect(doctorRepository.findById).toHaveBeenCalledWith(validDTO.doctorId);
      expect(specializationRepository.findById).toHaveBeenCalledWith(
        validDTO.specializationId,
      );
      expect(doctorSpecializationRepository.create).toHaveBeenCalledWith(
        validDTO,
      );
    });

    it('should throw ValidationException if doctorId is empty', async () => {
      const invalidDTO = { ...validDTO, doctorId: '' };

      await expect(useCase.execute(invalidDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException if doctor not found', async () => {
      doctorRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException if specialization not found', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      specializationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException if link already exists', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      specializationRepository.findById.mockResolvedValue(mockSpecialization);
      doctorSpecializationRepository.findByDoctorAndSpecialization.mockResolvedValue(
        mockDoctorSpecialization,
      );

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });
  });
});
