import { Test, TestingModule } from '@nestjs/testing';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import { UnitType } from '../../../shared/enums/unit.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { UpdateUnitUseCase } from './update-unit.use-case';

describe('UpdateUnitUseCase', () => {
  let useCase: UpdateUnitUseCase;
  let unitRepository: jest.Mocked<IUnitRepository>;

  const mockUnit = {
    id: 'unit-id-1',
    name: 'Hospital São Paulo',
    type: UnitType.HOSPITAL,
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234567',
    phone: '11999999999',
    email: 'contato@hospital.com',
    cnpj: '12345678000190',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUnitUseCase,
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

    useCase = module.get<UpdateUnitUseCase>(UpdateUnitUseCase);
    unitRepository = module.get('IUnitRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = { name: 'Hospital Atualizado', phone: '11888888888' };

    it('should update unit successfully', async () => {
      const updated = { ...mockUnit, ...validDTO };
      unitRepository.findById.mockResolvedValue(mockUnit);
      unitRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute('unit-id-1', validDTO);

      expect(unitRepository.findById).toHaveBeenCalledWith('unit-id-1');
      expect(unitRepository.update).toHaveBeenCalledWith('unit-id-1', validDTO);
      expect(result.name).toBe('Hospital Atualizado');
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.execute('', validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when name is whitespace only', async () => {
      unitRepository.findById.mockResolvedValue(mockUnit);

      await expect(
        useCase.execute('unit-id-1', { name: '   ' }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw UnitNotFoundException when unit not found', async () => {
      unitRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', validDTO),
      ).rejects.toThrow(UnitNotFoundException);
    });

    it('should throw DatabaseException on repository error', async () => {
      unitRepository.findById.mockResolvedValue(mockUnit);
      unitRepository.update.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('unit-id-1', validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });

    it('should allow updating only isActive', async () => {
      unitRepository.findById.mockResolvedValue(mockUnit);
      unitRepository.update.mockResolvedValue({ ...mockUnit, isActive: false });

      const result = await useCase.execute('unit-id-1', { isActive: false });

      expect(result.isActive).toBe(false);
    });
  });
});
