import { Test, TestingModule } from '@nestjs/testing';
import { CaregiverController } from './caregiver.controller';
import {
  CreateCaregiverUseCase,
  SearchCaregiverUseCase,
  UpdateCaregiverUseCase,
  DeleteCaregiverUseCase,
  LinkCaregiverUseCase,
} from '../../../application/use-cases/caregiver/caregiver.use-cases';
import { CaregiverNotFoundException } from '../../../shared/execeptions/caregiver/caregiver-not-found.exception';
import { CaregiverAlreadyExistsException } from '../../../shared/execeptions/caregiver/caregiver-already-exists.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CaregiverRelationship } from '../../../shared/enums/caregiver-relationship.enum';

describe('CaregiverController', () => {
  let controller: CaregiverController;
  let createUseCase: jest.Mocked<CreateCaregiverUseCase>;
  let searchUseCase: jest.Mocked<SearchCaregiverUseCase>;
  let updateUseCase: jest.Mocked<UpdateCaregiverUseCase>;
  let deleteUseCase: jest.Mocked<DeleteCaregiverUseCase>;

  const mockCaregiver = {
    id: 'caregiver-id-1',
    userId: 'user-id-1',
    cpf: '12345678901',
    relationship: CaregiverRelationship.PARENT,
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaregiverController],
      providers: [
        {
          provide: CreateCaregiverUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchCaregiverUseCase,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByPatientId: jest.fn(),
          },
        },
        {
          provide: UpdateCaregiverUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteCaregiverUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LinkCaregiverUseCase,
          useValue: { link: jest.fn(), unlink: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<CaregiverController>(CaregiverController);
    createUseCase = module.get(CreateCaregiverUseCase);
    searchUseCase = module.get(SearchCaregiverUseCase);
    updateUseCase = module.get(UpdateCaregiverUseCase);
    deleteUseCase = module.get(DeleteCaregiverUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a caregiver successfully', async () => {
      createUseCase.execute.mockResolvedValue(mockCaregiver);

      const result = await controller.create({
        userId: 'user-id-1',
        cpf: '12345678901',
        relationship: CaregiverRelationship.PARENT,
      });

      expect(createUseCase.execute).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should propagate CaregiverAlreadyExistsException', async () => {
      createUseCase.execute.mockRejectedValue(
        new CaregiverAlreadyExistsException('12345678901'),
      );

      await expect(
        controller.create({
          userId: 'user-id-1',
          cpf: '12345678901',
          relationship: CaregiverRelationship.PARENT,
        }),
      ).rejects.toThrow(CaregiverAlreadyExistsException);
    });
  });

  describe('findAll', () => {
    it('should return all caregivers', async () => {
      searchUseCase.findAll.mockResolvedValue([mockCaregiver]);
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return caregiver by id', async () => {
      searchUseCase.findById.mockResolvedValue(mockCaregiver);
      const result = await controller.findOne('caregiver-id-1');
      expect(result).toBeDefined();
    });

    it('should propagate CaregiverNotFoundException', async () => {
      searchUseCase.findById.mockRejectedValue(
        new CaregiverNotFoundException('nonexistent'),
      );

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        CaregiverNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update caregiver', async () => {
      const updated = {
        ...mockCaregiver,
        relationship: CaregiverRelationship.CHILD,
      };
      updateUseCase.execute.mockResolvedValue(updated);
      const result = await controller.update('caregiver-id-1', {
        relationship: CaregiverRelationship.CHILD,
      });
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete caregiver', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(
        controller.remove('caregiver-id-1'),
      ).resolves.toBeUndefined();
    });

    it('should propagate CaregiverNotFoundException', async () => {
      deleteUseCase.execute.mockRejectedValue(
        new CaregiverNotFoundException('nonexistent'),
      );
      await expect(controller.remove('nonexistent')).rejects.toThrow(
        CaregiverNotFoundException,
      );
    });
  });
});
