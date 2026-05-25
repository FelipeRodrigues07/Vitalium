import { Test, TestingModule } from '@nestjs/testing';
import { SpecializationController } from './specialization.controller';
import {
  CreateSpecializationUseCase,
  SearchSpecializationUseCase,
  UpdateSpecializationUseCase,
  DeleteSpecializationUseCase,
} from '../../../application/use-cases/specialization/specialization.use-cases';
import { SpecializationNotFoundException } from '../../../shared/execeptions/specialization/specialization-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

describe('SpecializationController', () => {
  let controller: SpecializationController;
  let createUseCase: jest.Mocked<CreateSpecializationUseCase>;
  let searchUseCase: jest.Mocked<SearchSpecializationUseCase>;
  let deleteUseCase: jest.Mocked<DeleteSpecializationUseCase>;

  const mockSpec = {
    id: 'spec-id-1',
    name: 'Cardiologia',
    description: 'Especialidade do coração',
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpecializationController],
      providers: [
        {
          provide: CreateSpecializationUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchSpecializationUseCase,
          useValue: { findById: jest.fn(), findAll: jest.fn() },
        },
        {
          provide: UpdateSpecializationUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteSpecializationUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<SpecializationController>(SpecializationController);
    createUseCase = module.get(CreateSpecializationUseCase);
    searchUseCase = module.get(SearchSpecializationUseCase);
    deleteUseCase = module.get(DeleteSpecializationUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a specialization', async () => {
      createUseCase.execute.mockResolvedValue(mockSpec);
      const result = await controller.create({ name: 'Cardiologia' });
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all specializations', async () => {
      searchUseCase.findAll.mockResolvedValue([mockSpec]);
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by isActive', async () => {
      searchUseCase.findAll.mockResolvedValue([mockSpec]);
      const result = await controller.findAll('true');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return specialization by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockSpec);
      expect(await controller.findById('spec-id-1')).toBeDefined();
    });

    it('should propagate SpecializationNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new SpecializationNotFoundException('nonexistent'),
      );
      await expect(controller.findById('nonexistent')).rejects.toThrow(
        SpecializationNotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete specialization', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(controller.delete('spec-id-1')).resolves.toBeUndefined();
    });
  });
});
