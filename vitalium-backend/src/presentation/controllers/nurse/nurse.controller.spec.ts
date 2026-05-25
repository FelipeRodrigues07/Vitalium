import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateNurseUseCase,
  DeleteNurseUseCase,
  SearchNurseUseCase,
  UpdateNurseUseCase,
} from '../../../application/use-cases/nurse/nurse.use-cases';
import { NurseAlreadyExistsException } from '../../../shared/execeptions/nurse/nurse-already-exists.exception';
import { NurseNotFoundException } from '../../../shared/execeptions/nurse/nurse-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { NurseController } from './nurse.controller';

describe('NurseController', () => {
  let controller: NurseController;
  let createUseCase: jest.Mocked<CreateNurseUseCase>;
  let searchUseCase: jest.Mocked<SearchNurseUseCase>;
  let deleteUseCase: jest.Mocked<DeleteNurseUseCase>;

  const mockNurse = {
    id: 'nurse-id-1',
    userId: 'user-id-1',
    coren: 'COREN-SP 123456',
    corenState: true,
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NurseController],
      providers: [
        { provide: CreateNurseUseCase, useValue: { execute: jest.fn() } },
        {
          provide: SearchNurseUseCase,
          useValue: { findById: jest.fn(), findAll: jest.fn() },
        },
        { provide: UpdateNurseUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteNurseUseCase, useValue: { execute: jest.fn() } },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<NurseController>(NurseController);
    createUseCase = module.get(CreateNurseUseCase);
    searchUseCase = module.get(SearchNurseUseCase);
    deleteUseCase = module.get(DeleteNurseUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a nurse', async () => {
      createUseCase.execute.mockResolvedValue(mockNurse);
      const result = await controller.create({
        userId: 'user-id-1',
        coren: 'COREN-SP 123456',
        corenState: true,
      });
      expect(result).toBeDefined();
    });

    it('should propagate NurseAlreadyExistsException', async () => {
      createUseCase.execute.mockRejectedValue(
        new NurseAlreadyExistsException('COREN-SP 123456'),
      );
      await expect(
        controller.create({
          userId: 'user-id-1',
          coren: 'COREN-SP 123456',
          corenState: true,
        }),
      ).rejects.toThrow(NurseAlreadyExistsException);
    });
  });

  describe('findAll', () => {
    it('should return all nurses', async () => {
      searchUseCase.findAll.mockResolvedValue([mockNurse]);
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return nurse by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockNurse);
      expect(await controller.findById('nurse-id-1')).toBeDefined();
    });

    it('should propagate NurseNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new NurseNotFoundException('nonexistent'),
      );
      await expect(controller.findById('nonexistent')).rejects.toThrow(
        NurseNotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete nurse', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(controller.delete('nurse-id-1')).resolves.toBeUndefined();
    });
  });
});
