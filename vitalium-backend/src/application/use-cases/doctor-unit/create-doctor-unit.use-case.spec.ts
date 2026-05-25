import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import { UnitType } from '../../../shared/enums/unit.enum';
import { ConflictException } from '../../../shared/execeptions/system/conflict.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitInvalidException } from '../../../shared/execeptions/units/unit-invalid.exception';
import { CreateDoctorUnitUseCase } from './create-doctor-unit.use-case';

describe('CreateDoctorUnitUseCase', () => {
  let useCase: CreateDoctorUnitUseCase;
  let doctorRepository: jest.Mocked<IDoctorRepository>;
  let doctorUnitRepository: jest.Mocked<IDoctorUnitRepository>;
  let unitRepository: jest.Mocked<IUnitRepository>;

  const mockDoctor = {
    id: 'doctor-id-1',
    userId: 'user-id-1',
    crm: 'CRM123456-SP',
    crmState: 'true',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockUnit = {
    id: 'unit-id-1',
    name: 'Hospital São Paulo',
    type: UnitType.HOSPITAL,
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
    email: 'contato@hospital.com',
    cnpj: '12345678000190',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockDoctorUnit = {
    id: 'doctor-unit-id-1',
    doctorId: 'doctor-id-1',
    unitId: 'unit-id-1',
    consultationPrice: 150.0,
    isPrimary: true,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDoctorUnitUseCase,
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
          provide: 'IDoctorUnitRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByDoctorId: jest.fn(),
            findByDoctorIdAndUnitId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'IUnitRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCnpj: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateDoctorUnitUseCase>(CreateDoctorUnitUseCase);
    doctorRepository = module.get('IDoctorRepository');
    doctorUnitRepository = module.get('IDoctorUnitRepository');
    unitRepository = module.get('IUnitRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      doctorId: 'doctor-id-1',
      unitId: 'unit-id-1',
      consultationPrice: 150.0,
      isPrimary: true,
      isActive: true,
    };

    it('should create a doctor-unit relationship successfully', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      unitRepository.findById.mockResolvedValue(mockUnit);
      doctorUnitRepository.findByDoctorIdAndUnitId.mockResolvedValue(null);
      doctorUnitRepository.create.mockResolvedValue(mockDoctorUnit);

      const result = await useCase.execute(validDTO);

      expect(doctorRepository.findById).toHaveBeenCalledWith(validDTO.doctorId);
      expect(unitRepository.findById).toHaveBeenCalledWith(validDTO.unitId);
      expect(doctorUnitRepository.findByDoctorIdAndUnitId).toHaveBeenCalledWith(
        validDTO.doctorId,
        validDTO.unitId,
      );
      expect(result).toEqual(mockDoctorUnit);
    });

    it('should throw ValidationException when consultation price is negative', async () => {
      const dto = { ...validDTO, consultationPrice: -10 };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when consultation price is zero', async () => {
      const dto = { ...validDTO, consultationPrice: 0 };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when doctor does not exist', async () => {
      doctorRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw UnitInvalidException when unit does not exist', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      unitRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UnitInvalidException,
      );
    });

    it('should throw UnitInvalidException when unit is inactive', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      unitRepository.findById.mockResolvedValue({
        ...mockUnit,
        isActive: false,
      });

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UnitInvalidException,
      );
    });

    it('should throw ConflictException for duplicate relationship', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      unitRepository.findById.mockResolvedValue(mockUnit);
      doctorUnitRepository.findByDoctorIdAndUnitId.mockResolvedValue(
        mockDoctorUnit,
      );

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw DatabaseException when repository create fails', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      unitRepository.findById.mockResolvedValue(mockUnit);
      doctorUnitRepository.findByDoctorIdAndUnitId.mockResolvedValue(null);
      doctorUnitRepository.create.mockRejectedValue(
        new Error('DB connection error'),
      );

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });

    it('should create without optional fields', async () => {
      const minimalDTO = {
        doctorId: 'doctor-id-1',
        unitId: 'unit-id-1',
      };

      const minimalResult = {
        ...mockDoctorUnit,
        consultationPrice: undefined,
        isPrimary: false,
        isActive: true,
      };

      doctorRepository.findById.mockResolvedValue(mockDoctor);
      unitRepository.findById.mockResolvedValue(mockUnit);
      doctorUnitRepository.findByDoctorIdAndUnitId.mockResolvedValue(null);
      doctorUnitRepository.create.mockResolvedValue(minimalResult);

      const result = await useCase.execute(minimalDTO);

      expect(result).toBeDefined();
      expect(result.doctorId).toBe('doctor-id-1');
    });
  });
});
