import { Test, TestingModule } from '@nestjs/testing';
import type { IUnitRepository } from '../../../domain/interfaces/repositories/units/unit.repository.interface';
import { UnitType } from '../../../shared/enums/unit.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { UnitAlreadyExistsException } from '../../../shared/execeptions/units/unit-already-exists.exception';
import { CreateUnitUseCase } from './create-unit.use-case';

describe('CreateUnitUseCase', () => {
  let useCase: CreateUnitUseCase;
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
        CreateUnitUseCase,
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

    useCase = module.get<CreateUnitUseCase>(CreateUnitUseCase);
    unitRepository = module.get('IUnitRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      name: 'Hospital São Paulo',
      type: UnitType.HOSPITAL,
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
      phone: '11999999999',
      email: 'contato@hospital.com',
      cnpj: '12345678000190',
    };

    it('should create a unit successfully', async () => {
      unitRepository.findByCnpj.mockResolvedValue(null);
      unitRepository.create.mockResolvedValue(mockUnit);

      const result = await useCase.execute(validDTO);

      expect(unitRepository.findByCnpj).toHaveBeenCalledWith(validDTO.cnpj);
      expect(unitRepository.create).toHaveBeenCalledWith(validDTO);
      expect(result).toEqual(mockUnit);
    });

    it('should throw UnitAlreadyExistsException for duplicate CNPJ', async () => {
      unitRepository.findByCnpj.mockResolvedValue(mockUnit);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UnitAlreadyExistsException,
      );
    });

    it('should throw DatabaseException when repository create fails', async () => {
      unitRepository.findByCnpj.mockResolvedValue(null);
      unitRepository.create.mockRejectedValue(new Error('DB connection error'));

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });

    it('should create different unit types', async () => {
      const clinicDTO = {
        ...validDTO,
        type: UnitType.CLINIC,
        cnpj: '98765432100100',
      };
      const clinicUnit = {
        ...mockUnit,
        type: UnitType.CLINIC,
        cnpj: '98765432100100',
      };

      unitRepository.findByCnpj.mockResolvedValue(null);
      unitRepository.create.mockResolvedValue(clinicUnit);

      const result = await useCase.execute(clinicDTO);

      expect(result.type).toBe(UnitType.CLINIC);
    });

    it('should create unit without optional phone', async () => {
      const dtoWithoutPhone = { ...validDTO };
      delete (dtoWithoutPhone as any).phone;

      const unitWithoutPhone = { ...mockUnit, phone: undefined };

      unitRepository.findByCnpj.mockResolvedValue(null);
      unitRepository.create.mockResolvedValue(unitWithoutPhone);

      const result = await useCase.execute(dtoWithoutPhone);

      expect(result).toBeDefined();
      expect(result.phone).toBeUndefined();
    });
  });
});
