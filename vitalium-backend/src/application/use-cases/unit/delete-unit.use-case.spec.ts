import { Test, TestingModule } from '@nestjs/testing';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import { UnitType } from '../../../shared/enums/unit.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { DeleteUnitUseCase } from './delete-unit.use-case';

describe('DeleteUnitUseCase', () => {
  let useCase: DeleteUnitUseCase;
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
        DeleteUnitUseCase,
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

    useCase = module.get<DeleteUnitUseCase>(DeleteUnitUseCase);
    unitRepository = module.get('IUnitRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete unit successfully', async () => {
      unitRepository.findById.mockResolvedValue(mockUnit);
      unitRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute('unit-id-1')).resolves.toBeUndefined();

      expect(unitRepository.findById).toHaveBeenCalledWith('unit-id-1');
      expect(unitRepository.delete).toHaveBeenCalledWith('unit-id-1');
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.execute('')).rejects.toThrow(ValidationException);
    });

    it('should throw UnitNotFoundException when unit not found', async () => {
      unitRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        UnitNotFoundException,
      );
    });

    it('should throw DatabaseException on repository delete error', async () => {
      unitRepository.findById.mockResolvedValue(mockUnit);
      unitRepository.delete.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('unit-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
