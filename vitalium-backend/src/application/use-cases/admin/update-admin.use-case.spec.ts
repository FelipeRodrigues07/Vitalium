import { Test, TestingModule } from '@nestjs/testing';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import { AdminRole } from '../../../shared/enums/admin-role.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { UpdateAdminUseCase } from './update-admin.use-case';

describe('UpdateAdminUseCase', () => {
  let useCase: UpdateAdminUseCase;
  let adminRepository: jest.Mocked<IAdminRepository>;

  const mockAdmin = {
    id: 'admin-id-1',
    userId: 'user-id-1',
    role: AdminRole.HOSPITAL_ADMIN,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const updatedAdmin = { ...mockAdmin, role: AdminRole.CLINIC_ADMIN };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAdminUseCase,
        {
          provide: 'IAdminRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateAdminUseCase>(UpdateAdminUseCase);
    adminRepository = module.get('IAdminRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = { role: AdminRole.CLINIC_ADMIN };

    it('should update admin successfully', async () => {
      adminRepository.findById.mockResolvedValue(mockAdmin);
      adminRepository.update.mockResolvedValue(updatedAdmin);

      const result = await useCase.execute('admin-id-1', validDTO);

      expect(adminRepository.findById).toHaveBeenCalledWith('admin-id-1');
      expect(adminRepository.update).toHaveBeenCalledWith(
        'admin-id-1',
        validDTO,
      );
      expect(result.role).toBe(AdminRole.CLINIC_ADMIN);
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.execute('', validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw UnitNotFoundException when admin not found', async () => {
      adminRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', validDTO),
      ).rejects.toThrow(UnitNotFoundException);
    });

    it('should throw DatabaseException on repository error', async () => {
      adminRepository.findById.mockResolvedValue(mockAdmin);
      adminRepository.update.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('admin-id-1', validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });

    it('should allow updating isActive field', async () => {
      const inactiveDTO = { isActive: false };
      adminRepository.findById.mockResolvedValue(mockAdmin);
      adminRepository.update.mockResolvedValue({
        ...mockAdmin,
        isActive: false,
      });

      const result = await useCase.execute('admin-id-1', inactiveDTO);

      expect(result.isActive).toBe(false);
    });
  });
});
