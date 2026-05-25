import { Test, TestingModule } from '@nestjs/testing';
import { CreateUnitUseCase } from '../../../application/use-cases/unit/create-unit.use-case';
import { DeleteUnitUseCase } from '../../../application/use-cases/unit/delete-unit.use-case';
import { SearchUnitUseCase } from '../../../application/use-cases/unit/search-unit.use-case';
import { UpdateUnitUseCase } from '../../../application/use-cases/unit/update-unit.use-case';
import { UnitType } from '../../../shared/enums/unit.enum';
import { UnitAlreadyExistsException } from '../../../shared/execeptions/units/unit-already-exists.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateUnitDTO } from '../../dto/unitDTO/create-unit.dto';
import { UnitController } from './unit.controller';

describe('UnitController', () => {
  let controller: UnitController;
  let createUnitUseCase: jest.Mocked<CreateUnitUseCase>;

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
      controllers: [UnitController],
      providers: [
        {
          provide: CreateUnitUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchUnitUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUnitUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUnitUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UnitController>(UnitController);
    createUnitUseCase = module.get(CreateUnitUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUnit', () => {
    const createUnitDTO: CreateUnitDTO = {
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
      createUnitUseCase.execute.mockResolvedValue(mockUnit);

      const result = await controller.createUnit(createUnitDTO);

      expect(createUnitUseCase.execute).toHaveBeenCalledWith(createUnitDTO);
      expect(result).toBeDefined();
      expect(result.name).toBe(mockUnit.name);
      expect(result.type).toBe(mockUnit.type);
      expect(result.id).toBe(mockUnit.id);
    });

    it('should create a clinic unit', async () => {
      const clinicDTO: CreateUnitDTO = {
        ...createUnitDTO,
        name: 'Clínica Cardiologia',
        type: UnitType.CLINIC,
      };

      const clinicUnit = {
        ...mockUnit,
        id: 'unit-id-2',
        name: 'Clínica Cardiologia',
        type: UnitType.CLINIC,
      };

      createUnitUseCase.execute.mockResolvedValue(clinicUnit);

      const result = await controller.createUnit(clinicDTO);

      expect(result.type).toBe(UnitType.CLINIC);
    });

    it('should propagate UnitAlreadyExistsException for duplicate CNPJ', async () => {
      createUnitUseCase.execute.mockRejectedValue(
        new UnitAlreadyExistsException('12345678000190'),
      );

      await expect(controller.createUnit(createUnitDTO)).rejects.toThrow(
        UnitAlreadyExistsException,
      );
    });

    it('should propagate errors from use case', async () => {
      createUnitUseCase.execute.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(controller.createUnit(createUnitDTO)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });
});
