import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UpdateDoctorUseCase } from './update-doctor.use-case';

describe('UpdateDoctorUseCase', () => {
  let useCase: UpdateDoctorUseCase;
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
        UpdateDoctorUseCase,
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

    useCase = module.get<UpdateDoctorUseCase>(UpdateDoctorUseCase);
    doctorRepository = module.get('IDoctorRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = { crm: 'CRM999999-RJ', crmState: false };

    it('should update doctor successfully', async () => {
      const updatedDoctor = {
        ...mockDoctor,
        crm: 'CRM999999-RJ',
        crmState: 'false',
      };
      doctorRepository.update.mockResolvedValue(updatedDoctor);

      const result = await useCase.execute('doctor-id-1', validDTO);

      expect(doctorRepository.update).toHaveBeenCalledWith(
        'doctor-id-1',
        validDTO,
      );
      expect(result.crm).toBe('CRM999999-RJ');
    });

    it('should throw ValidationException when CRM is missing', async () => {
      await expect(useCase.execute('doctor-id-1', { crm: '' })).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw DoctorNotFoundException when doctor not found after update', async () => {
      doctorRepository.update.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', validDTO),
      ).rejects.toThrow(DoctorNotFoundException);
    });

    it('should throw DatabaseException on unexpected repository error', async () => {
      doctorRepository.update.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('doctor-id-1', validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
