import { Test, TestingModule } from '@nestjs/testing';
import { DoctorSpecializationController } from './doctor-specialization.controller';
import { CreateDoctorSpecializationUseCase } from '../../../application/use-cases/doctor-specialization/create-doctor-specialization.use-case';
import { SearchDoctorSpecializationUseCase } from '../../../application/use-cases/doctor-specialization/search-doctor-specialization.use-case';
import { DeleteDoctorSpecializationUseCase } from '../../../application/use-cases/doctor-specialization/delete-doctor-specialization.use-case';
import { DoctorSpecializationNotFoundException } from '../../../shared/execeptions/specialization/doctor-specialization-not-found.exception';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';

describe('DoctorSpecializationController', () => {
  let controller: DoctorSpecializationController;
  let createUseCase: jest.Mocked<CreateDoctorSpecializationUseCase>;
  let searchUseCase: jest.Mocked<SearchDoctorSpecializationUseCase>;
  let deleteUseCase: jest.Mocked<DeleteDoctorSpecializationUseCase>;

  const mockLink = {
    id: 'doc-spec-id-1',
    doctorId: 'doctor-id-1',
    specializationId: 'spec-id-1',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorSpecializationController],
      providers: [
        {
          provide: CreateDoctorSpecializationUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchDoctorSpecializationUseCase,
          useValue: {
            findById: jest.fn(),
            findByDoctorId: jest.fn(),
            findBySpecializationId: jest.fn(),
          },
        },
        {
          provide: DeleteDoctorSpecializationUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<DoctorSpecializationController>(
      DoctorSpecializationController,
    );
    createUseCase = module.get(CreateDoctorSpecializationUseCase);
    searchUseCase = module.get(SearchDoctorSpecializationUseCase);
    deleteUseCase = module.get(DeleteDoctorSpecializationUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a doctor-specialization link', async () => {
      createUseCase.execute.mockResolvedValue(mockLink);
      const result = await controller.create({
        doctorId: 'doctor-id-1',
        specializationId: 'spec-id-1',
      });
      expect(result).toBeDefined();
    });
  });

  describe('findByDoctorId', () => {
    it('should return links by doctor', async () => {
      searchUseCase.findByDoctorId.mockResolvedValue([mockLink]);
      const result = await controller.findByDoctorId('doctor-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findBySpecializationId', () => {
    it('should return links by specialization', async () => {
      searchUseCase.findBySpecializationId.mockResolvedValue([mockLink]);
      const result = await controller.findBySpecializationId('spec-id-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete link', async () => {
      deleteUseCase.execute.mockResolvedValue(undefined);
      await expect(controller.delete('doc-spec-id-1')).resolves.toBeUndefined();
    });

    it('should propagate DoctorSpecializationNotFoundException', async () => {
      deleteUseCase.execute.mockRejectedValue(
        new DoctorSpecializationNotFoundException('nonexistent'),
      );
      await expect(controller.delete('nonexistent')).rejects.toThrow(
        DoctorSpecializationNotFoundException,
      );
    });
  });
});
