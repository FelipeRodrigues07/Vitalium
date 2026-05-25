import { Test, TestingModule } from '@nestjs/testing';
import { CreateDoctorUseCase } from '../../../application/use-cases/doctor/create-doctor.use-case';
import { DeleteDoctorUseCase } from '../../../application/use-cases/doctor/delete-doctor.use-case';
import { SearchDoctorUseCase } from '../../../application/use-cases/doctor/search-doctor.use-case';
import { UpdateDoctorUseCase } from '../../../application/use-cases/doctor/update-doctor.use-case';
import { DoctorAlreadyExistsException } from '../../../shared/execeptions/doctor/doctor-already-exists.exception';
import { DoctorNotFoundException } from '../../../shared/execeptions/doctor/doctor-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateDoctorDTO } from '../../dto/doctorDTO/create-doctor.dto';
import { DoctorController } from './doctor.controller';

describe('DoctorController', () => {
  let controller: DoctorController;
  let createDoctorUseCase: jest.Mocked<CreateDoctorUseCase>;
  let searchDoctorUseCase: jest.Mocked<SearchDoctorUseCase>;

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
      controllers: [DoctorController],
      providers: [
        {
          provide: CreateDoctorUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchDoctorUseCase,
          useValue: { findById: jest.fn(), findAll: jest.fn() },
        },
        {
          provide: UpdateDoctorUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteDoctorUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<DoctorController>(DoctorController);
    createDoctorUseCase = module.get(CreateDoctorUseCase);
    searchDoctorUseCase = module.get(SearchDoctorUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDoctorDTO: CreateDoctorDTO = {
      crm: 'CRM123456-SP',
      crmState: true,
      isActive: true,
      userId: 'user-id-1',
    };

    it('should create a doctor successfully', async () => {
      createDoctorUseCase.execute.mockResolvedValue(mockDoctor);

      const result = await controller.create(createDoctorDTO);

      expect(createDoctorUseCase.execute).toHaveBeenCalledWith(createDoctorDTO);
      expect(result).toBeDefined();
      expect(result.crm).toBe(mockDoctor.crm);
      expect(result.id).toBe(mockDoctor.id);
      expect(result.userId).toBe(mockDoctor.userId);
    });

    it('should propagate DoctorAlreadyExistsException for duplicate CRM', async () => {
      createDoctorUseCase.execute.mockRejectedValue(
        new DoctorAlreadyExistsException('CRM123456-SP'),
      );

      await expect(controller.create(createDoctorDTO)).rejects.toThrow(
        DoctorAlreadyExistsException,
      );
    });

    it('should propagate errors from use case', async () => {
      createDoctorUseCase.execute.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(controller.create(createDoctorDTO)).rejects.toThrow(
        'Unexpected error',
      );
    });
  });

  describe('findOne', () => {
    it('should find a doctor by id', async () => {
      searchDoctorUseCase.findById.mockResolvedValue(mockDoctor);

      const result = await controller.findOne('doctor-id-1');

      expect(searchDoctorUseCase.findById).toHaveBeenCalledWith('doctor-id-1');
      expect(result).toBeDefined();
      expect(result.id).toBe('doctor-id-1');
      expect(result.crm).toBe(mockDoctor.crm);
    });

    it('should propagate DoctorNotFoundException for non-existent id', async () => {
      searchDoctorUseCase.findById.mockRejectedValue(
        new DoctorNotFoundException('ID: non-existent-id'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        DoctorNotFoundException,
      );
    });
  });
});
