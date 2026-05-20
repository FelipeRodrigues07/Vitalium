import { Test, TestingModule } from '@nestjs/testing';
import { DeleteSpecializationUseCase } from './delete-specialization.use-case';
import { NotFoundException } from '@nestjs/common';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';

describe('DeleteSpecializationUseCase', () => {
  let useCase: DeleteSpecializationUseCase;
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
        DeleteSpecializationUseCase,
        {
          provide: 'ISpecializationRepository',
          useValue: specializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<DeleteSpecializationUseCase>(
      DeleteSpecializationUseCase,
    );
    specializationRepository = module.get('ISpecializationRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a specialization successfully', async () => {
      specializationRepository.findById.mockResolvedValue(mockSpecialization);
      specializationRepository.delete.mockResolvedValue(undefined);

      await useCase.execute('specialization-id-1');

      expect(specializationRepository.findById).toHaveBeenCalledWith(
        'specialization-id-1',
      );
      expect(specializationRepository.delete).toHaveBeenCalledWith(
        'specialization-id-1',
      );
    });

    it('should throw NotFoundException if specialization not found', async () => {
      specializationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
