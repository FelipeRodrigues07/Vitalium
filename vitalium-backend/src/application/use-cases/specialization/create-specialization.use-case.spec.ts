import { Test, TestingModule } from '@nestjs/testing';
import { CreateSpecializationUseCase } from './create-specialization.use-case';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';

describe('CreateSpecializationUseCase', () => {
  let useCase: CreateSpecializationUseCase;
  let specializationRepository: jest.Mocked<ISpecializationRepository>;

  const mockSpecialization = {
    id: 'specialization-id-1',
    name: 'Cardiologia',
    description: 'Especialidade médica que cuida do coração',
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const specializationRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSpecializationUseCase,
        {
          provide: 'ISpecializationRepository',
          useValue: specializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateSpecializationUseCase>(
      CreateSpecializationUseCase,
    );
    specializationRepository = module.get('ISpecializationRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      name: 'Cardiologia',
      description: 'Especialidade médica que cuida do coração',
      isActive: true,
    };

    it('should create a specialization successfully', async () => {
      specializationRepository.findByName.mockResolvedValue(null);
      specializationRepository.create.mockResolvedValue(mockSpecialization);

      const result = await useCase.execute(validDTO);

      expect(result).toEqual(mockSpecialization);
      expect(specializationRepository.findByName).toHaveBeenCalledWith(
        validDTO.name,
      );
      expect(specializationRepository.create).toHaveBeenCalledWith(validDTO);
    });

    it('should throw ValidationException if name is empty', async () => {
      const invalidDTO = { ...validDTO, name: '' };

      await expect(useCase.execute(invalidDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException if specialization name already exists', async () => {
      specializationRepository.findByName.mockResolvedValue(mockSpecialization);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
      expect(specializationRepository.findByName).toHaveBeenCalledWith(
        validDTO.name,
      );
    });
  });
});
