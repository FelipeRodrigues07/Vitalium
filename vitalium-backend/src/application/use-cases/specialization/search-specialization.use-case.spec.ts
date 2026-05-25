import { Test, TestingModule } from '@nestjs/testing';
import { SearchSpecializationUseCase } from './search-specialization.use-case';
import { NotFoundException } from '@nestjs/common';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';

describe('SearchSpecializationUseCase', () => {
  let useCase: SearchSpecializationUseCase;
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
        SearchSpecializationUseCase,
        {
          provide: 'ISpecializationRepository',
          useValue: specializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<SearchSpecializationUseCase>(
      SearchSpecializationUseCase,
    );
    specializationRepository = module.get('ISpecializationRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return a specialization by id', async () => {
      specializationRepository.findById.mockResolvedValue(mockSpecialization);

      const result = await useCase.findById('specialization-id-1');

      expect(result).toEqual(mockSpecialization);
      expect(specializationRepository.findById).toHaveBeenCalledWith(
        'specialization-id-1',
      );
    });

    it('should throw NotFoundException if specialization not found', async () => {
      specializationRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active specializations', async () => {
      const mockSpecializations = [mockSpecialization];
      specializationRepository.findAll.mockResolvedValue(mockSpecializations);

      const result = await useCase.findAll();

      expect(result).toEqual(mockSpecializations);
      expect(specializationRepository.findAll).toHaveBeenCalled();
    });
  });
});
