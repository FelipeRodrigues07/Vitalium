import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { ISpecializationRepository } from '../../../domain/interfaces/repositories/specialization/specialization.repository.interface';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UpdateSpecializationUseCase } from './update-specialization.use-case';

describe('UpdateSpecializationUseCase', () => {
  let useCase: UpdateSpecializationUseCase;
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
        UpdateSpecializationUseCase,
        {
          provide: 'ISpecializationRepository',
          useValue: specializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<UpdateSpecializationUseCase>(
      UpdateSpecializationUseCase,
    );
    specializationRepository = module.get('ISpecializationRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const updateDTO = {
      name: 'Cardiologia Atualizada',
      description: 'Nova descrição',
    };

    it('should update a specialization successfully', async () => {
      const updatedSpecialization = { ...mockSpecialization, ...updateDTO };
      specializationRepository.findById.mockResolvedValue(mockSpecialization);
      specializationRepository.findByName.mockResolvedValue(null);
      specializationRepository.update.mockResolvedValue(updatedSpecialization);

      const result = await useCase.execute('specialization-id-1', updateDTO);

      expect(result).toEqual(updatedSpecialization);
      expect(specializationRepository.findById).toHaveBeenCalledWith(
        'specialization-id-1',
      );
      expect(specializationRepository.update).toHaveBeenCalledWith(
        'specialization-id-1',
        updateDTO,
      );
    });

    it('should throw NotFoundException if specialization not found', async () => {
      specializationRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', updateDTO),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ValidationException if new name already exists', async () => {
      const otherSpecialization = { ...mockSpecialization, id: 'other-id' };
      specializationRepository.findById.mockResolvedValue(mockSpecialization);
      specializationRepository.findByName.mockResolvedValue(
        otherSpecialization,
      );

      await expect(
        useCase.execute('specialization-id-1', updateDTO),
      ).rejects.toThrow(ValidationException);
    });
  });
});
