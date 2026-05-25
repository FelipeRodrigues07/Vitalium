import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { UpdateDoctorUnitUseCase } from './update-doctor-unit.use-case';

describe('UpdateDoctorUnitUseCase', () => {
  let useCase: UpdateDoctorUnitUseCase;
  let doctorUnitRepository: jest.Mocked<IDoctorUnitRepository>;

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
        UpdateDoctorUnitUseCase,
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
      ],
    }).compile();

    useCase = module.get<UpdateDoctorUnitUseCase>(UpdateDoctorUnitUseCase);
    doctorUnitRepository = module.get('IDoctorUnitRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = { consultationPrice: 200.0, isPrimary: false };

    it('should update doctor-unit successfully', async () => {
      const updated = { ...mockDoctorUnit, ...validDTO };
      doctorUnitRepository.findById.mockResolvedValue(mockDoctorUnit);
      doctorUnitRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute('doctor-unit-id-1', validDTO);

      expect(doctorUnitRepository.findById).toHaveBeenCalledWith(
        'doctor-unit-id-1',
      );
      expect(doctorUnitRepository.update).toHaveBeenCalledWith(
        'doctor-unit-id-1',
        validDTO,
      );
      expect(result.consultationPrice).toBe(200.0);
      expect(result.isPrimary).toBe(false);
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.execute('', validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when consultationPrice is zero', async () => {
      await expect(
        useCase.execute('doctor-unit-id-1', { consultationPrice: 0 }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when consultationPrice is negative', async () => {
      await expect(
        useCase.execute('doctor-unit-id-1', { consultationPrice: -50 }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw UnitNotFoundException when association not found', async () => {
      doctorUnitRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', validDTO),
      ).rejects.toThrow(UnitNotFoundException);
    });

    it('should throw DatabaseException on repository error', async () => {
      doctorUnitRepository.findById.mockResolvedValue(mockDoctorUnit);
      doctorUnitRepository.update.mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute('doctor-unit-id-1', validDTO),
      ).rejects.toThrow(DatabaseException);
    });

    it('should allow updating only isActive', async () => {
      const dto = { isActive: false };
      doctorUnitRepository.findById.mockResolvedValue(mockDoctorUnit);
      doctorUnitRepository.update.mockResolvedValue({
        ...mockDoctorUnit,
        isActive: false,
      });

      const result = await useCase.execute('doctor-unit-id-1', dto);

      expect(result.isActive).toBe(false);
    });
  });
});
