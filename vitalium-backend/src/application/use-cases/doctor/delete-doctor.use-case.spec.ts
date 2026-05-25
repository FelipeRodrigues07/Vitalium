import { Test, TestingModule } from '@nestjs/testing';
import type { IDoctorRepository } from '../../../domain/interfaces/repositories/doctor/doctor.repository.interface';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { DeleteDoctorUseCase } from './delete-doctor.use-case';

describe('DeleteDoctorUseCase', () => {
  let useCase: DeleteDoctorUseCase;
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
        DeleteDoctorUseCase,
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

    useCase = module.get<DeleteDoctorUseCase>(DeleteDoctorUseCase);
    doctorRepository = module.get('IDoctorRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete doctor successfully', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      doctorRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute('doctor-id-1')).resolves.toBeUndefined();

      expect(doctorRepository.findById).toHaveBeenCalledWith('doctor-id-1');
      expect(doctorRepository.delete).toHaveBeenCalledWith('doctor-id-1');
    });

    it('should throw DoctorNotFoundException when doctor not found', async () => {
      doctorRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        DoctorNotFoundException,
      );
    });

    it('should throw DatabaseException on repository delete error', async () => {
      doctorRepository.findById.mockResolvedValue(mockDoctor);
      doctorRepository.delete.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('doctor-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
