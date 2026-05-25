import { Test, TestingModule } from '@nestjs/testing';
import { SearchDoctorSpecializationUseCase } from './search-doctor-specialization.use-case';
import { NotFoundException } from '@nestjs/common';
import type { IDoctorSpecializationRepository } from '../../../domain/interfaces/repositories/doctor-specialization/doctor-specialization.repository.interface';

describe('SearchDoctorSpecializationUseCase', () => {
  let useCase: SearchDoctorSpecializationUseCase;
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
        SearchDoctorSpecializationUseCase,
        {
          provide: 'IDoctorSpecializationRepository',
          useValue: doctorSpecializationRepositoryMock,
        },
      ],
    }).compile();

    useCase = module.get<SearchDoctorSpecializationUseCase>(
      SearchDoctorSpecializationUseCase,
    );
    doctorSpecializationRepository = module.get(
      'IDoctorSpecializationRepository',
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return a doctor-specialization by id', async () => {
      doctorSpecializationRepository.findById.mockResolvedValue(
        mockDoctorSpecialization,
      );

      const result = await useCase.findById('doctor-specialization-id-1');

      expect(result).toEqual(mockDoctorSpecialization);
      expect(doctorSpecializationRepository.findById).toHaveBeenCalledWith(
        'doctor-specialization-id-1',
      );
    });

    it('should throw NotFoundException if not found', async () => {
      doctorSpecializationRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByDoctorId', () => {
    it('should return specializations for a doctor', async () => {
      const mockList = [mockDoctorSpecialization];
      doctorSpecializationRepository.findByDoctorId.mockResolvedValue(mockList);

      const result = await useCase.findByDoctorId('doctor-id-1');

      expect(result).toEqual(mockList);
      expect(
        doctorSpecializationRepository.findByDoctorId,
      ).toHaveBeenCalledWith('doctor-id-1');
    });
  });

  describe('findBySpecializationId', () => {
    it('should return doctors for a specialization', async () => {
      const mockList = [mockDoctorSpecialization];
      doctorSpecializationRepository.findBySpecializationId.mockResolvedValue(
        mockList,
      );

      const result = await useCase.findBySpecializationId(
        'specialization-id-1',
      );

      expect(result).toEqual(mockList);
      expect(
        doctorSpecializationRepository.findBySpecializationId,
      ).toHaveBeenCalledWith('specialization-id-1');
    });
  });
});
