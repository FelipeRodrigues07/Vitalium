import { Test, TestingModule } from '@nestjs/testing';
import { SearchDoctorUseCase } from './search-doctor.use-case';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';

describe('SearchDoctorUseCase', () => {
  let useCase: SearchDoctorUseCase;
  let doctorRepository: jest.Mocked<IDoctorRepository>;

  const mockDoctor = {
    id: 'doctor-id-1',
    userId: 'user-id-1',
    crm: 'CRM123456-SP',
    crmState: 'true',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchDoctorUseCase,
        {
          provide: 'IDoctorRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByCrm: jest.fn(),
            findByUserId: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<SearchDoctorUseCase>(SearchDoctorUseCase);
    doctorRepository = module.get('IDoctorRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return a doctor by id', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);

      const result = await useCase.findById('doctor-id-1');

      expect(doctorRepository.findById).toHaveBeenCalledWith('doctor-id-1');
      expect(result).toEqual(mockDoctor);
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.findById('')).rejects.toThrow(ValidationException);
    });

    it('should throw DoctorNotFoundException when doctor does not exist', async () => {
      doctorRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        DoctorNotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all doctors', async () => {
      const doctors = [mockDoctor, { ...mockDoctor, id: 'doctor-id-2' }];
      doctorRepository.findAll.mockResolvedValue(doctors);

      const result = await useCase.findAll();

      expect(doctorRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no doctors exist', async () => {
      doctorRepository.findAll.mockResolvedValue([]);

      const result = await useCase.findAll();
      expect(result).toEqual([]);
    });

    it('should return empty array when result is null', async () => {
      doctorRepository.findAll.mockResolvedValue(null as any);

      const result = await useCase.findAll();
      expect(result).toEqual([]);
    });
  });
});
