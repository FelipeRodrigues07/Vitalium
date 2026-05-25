import { Test, TestingModule } from '@nestjs/testing';
import { DeleteDoctorSpecializationUseCase } from './delete-doctor-specialization.use-case';
import { NotFoundException } from '@nestjs/common';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';

describe('DeleteDoctorSpecializationUseCase', () => {
  let useCase: DeleteDoctorSpecializationUseCase;
  let doctorSpecializationRepository: jest.Mocked<IDoctorSpecializationRepository>;

  const mockDoctorSpecialization = {
    id: 'doctor-specialization-id-1',
    doctorId: 'doctor-id-1',
    specializationId: 'specialization-id-1',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const doctorSpecializationRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByDoctorAndSpecialization: jest.fn(),
    findByDoctorId: jest.fn(),
    findBySpecializationId: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteDoctorSpecializationUseCase,
        {
          provide: 'IDoctorSpecializationRepository',
          useValue: doctorSpecializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<DeleteDoctorSpecializationUseCase>(
      DeleteDoctorSpecializationUseCase,
    );
    doctorSpecializationRepository = module.get(
      'IDoctorSpecializationRepository',
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a doctor-specialization link successfully', async () => {
      doctorSpecializationRepository.findById.mockResolvedValue(
        mockDoctorSpecialization,
      );
      doctorSpecializationRepository.delete.mockResolvedValue(undefined);

      await useCase.execute('doctor-specialization-id-1');

      expect(doctorSpecializationRepository.findById).toHaveBeenCalledWith(
        'doctor-specialization-id-1',
      );
      expect(doctorSpecializationRepository.delete).toHaveBeenCalledWith(
        'doctor-specialization-id-1',
      );
    });

    it('should throw NotFoundException if not found', async () => {
      doctorSpecializationRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
