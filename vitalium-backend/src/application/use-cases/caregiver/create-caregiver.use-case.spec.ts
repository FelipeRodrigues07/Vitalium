import { Test, TestingModule } from '@nestjs/testing';
import type { ICaregiverRepository } from '../../../domain/interfaces/repositories/caregiver/caregiver.repository.interface';
import { CaregiverRelationship } from '../../../shared/enums/caregiver-relationship.enum';
import { CaregiverAlreadyExistsException } from '../../../shared/execeptions/caregiver/caregiver-already-exists.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { CreateCaregiverUseCase } from './caregiver.use-cases';

describe('CreateCaregiverUseCase', () => {
  let useCase: CreateCaregiverUseCase;
  let repo: jest.Mocked<ICaregiverRepository>;

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
      providers: [
        CreateCaregiverUseCase,
        {
          provide: 'ICaregiverRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCpf: jest.fn(),
            findAll: jest.fn(),
            findByPatientId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            linkToPatient: jest.fn(),
            unlinkFromPatient: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateCaregiverUseCase>(CreateCaregiverUseCase);
    repo = module.get('ICaregiverRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      userId: 'user-id-1',
      cpf: '12345678901',
      relationship: CaregiverRelationship.PARENT,
    };

    it('should create a caregiver successfully', async () => {
      repo.findByCpf.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockCaregiver);

      const result = await useCase.execute(validDTO);

      expect(repo.findByCpf).toHaveBeenCalledWith(validDTO.cpf);
      expect(repo.create).toHaveBeenCalledWith(validDTO);
      expect(result).toEqual(mockCaregiver);
    });

    it('should throw CaregiverAlreadyExistsException when CPF already registered', async () => {
      repo.findByCpf.mockResolvedValue(mockCaregiver);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        CaregiverAlreadyExistsException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('should throw DatabaseException on repository error', async () => {
      repo.findByCpf.mockResolvedValue(null);
      repo.create.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
