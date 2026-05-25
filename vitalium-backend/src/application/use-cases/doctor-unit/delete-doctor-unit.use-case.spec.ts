import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorUnitRepository } from '../../../domain/interfaces/repositories/doctor-unit/doctor-unit.repository.interface';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { DeleteDoctorUnitUseCase } from './delete-doctor-unit.use-case';

describe('DeleteDoctorUnitUseCase', () => {
  let useCase: DeleteDoctorUnitUseCase;
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
        DeleteDoctorUnitUseCase,
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

    useCase = module.get<DeleteDoctorUnitUseCase>(DeleteDoctorUnitUseCase);
    doctorUnitRepository = module.get('IDoctorUnitRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete doctor-unit association successfully', async () => {
      doctorUnitRepository.findById.mockResolvedValue(mockDoctorUnit);
      doctorUnitRepository.delete.mockResolvedValue(undefined);

      await expect(
        useCase.execute('doctor-unit-id-1'),
      ).resolves.toBeUndefined();

      expect(doctorUnitRepository.findById).toHaveBeenCalledWith(
        'doctor-unit-id-1',
      );
      expect(doctorUnitRepository.delete).toHaveBeenCalledWith(
        'doctor-unit-id-1',
      );
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.execute('')).rejects.toThrow(ValidationException);
    });

    it('should throw UnitNotFoundException when association not found', async () => {
      doctorUnitRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        UnitNotFoundException,
      );
    });

    it('should throw DatabaseException on repository delete error', async () => {
      doctorUnitRepository.findById.mockResolvedValue(mockDoctorUnit);
      doctorUnitRepository.delete.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('doctor-unit-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
