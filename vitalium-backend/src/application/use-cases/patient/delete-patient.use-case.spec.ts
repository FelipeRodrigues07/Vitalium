import { Test, TestingModule } from '@nestjs/testing';
import type { IPatientRepository } from '../../../domain/interfaces/repositories/patient/patient.repository.interface';
import { PatientNotFoundException } from '../../../shared/execeptions/patient/patient-not-found.exception';
import { DeletePatientUseCase } from './delete-patient.use-case';

describe('DeletePatientUseCase', () => {
  let useCase: DeletePatientUseCase;
  let patientRepository: jest.Mocked<IPatientRepository>;

  const patientRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    findAllByDoctorId: jest.fn(),
    findAllByUnitId: jest.fn(),
    findFirstByPatientId: jest.fn(),
    findByWhatsappPhone: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePatientUseCase,
        { provide: 'IPatientRepository', useValue: patientRepositoryMock },
      ],
    }).compile();

    useCase = module.get<DeletePatientUseCase>(DeletePatientUseCase);
    patientRepository = module.get('IPatientRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a patient successfully', async () => {
      patientRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute('patient-id-1')).resolves.toBeUndefined();
      expect(patientRepository.delete).toHaveBeenCalledWith('patient-id-1');
    });

    it('should throw PatientNotFoundException when patient not found', async () => {
      patientRepository.delete.mockRejectedValue(
        new Error('Patient with id non-existent not found'),
      );

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        PatientNotFoundException,
      );
    });
  });
});
