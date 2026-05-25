import { Test, TestingModule } from '@nestjs/testing';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import { AdminRole } from '../../../shared/enums/admin-role.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UnitNotFoundException } from '../../../shared/execeptions/units/unit-not-found.exception';
import { DeleteAdminUseCase } from './delete-admin.use-case';

describe('DeleteAdminUseCase', () => {
  let useCase: DeleteAdminUseCase;
  let adminRepository: jest.Mocked<IAdminRepository>;

  const mockAdmin = {
    id: 'admin-id-1',
    userId: 'user-id-1',
    role: AdminRole.HOSPITAL_ADMIN,
    isActive: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAdminUseCase,
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

    useCase = module.get<DeleteAdminUseCase>(DeleteAdminUseCase);
    adminRepository = module.get('IAdminRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete admin successfully', async () => {
      adminRepository.findById.mockResolvedValue(mockAdmin);
      adminRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute('admin-id-1')).resolves.toBeUndefined();

      expect(adminRepository.findById).toHaveBeenCalledWith('admin-id-1');
      expect(adminRepository.delete).toHaveBeenCalledWith('admin-id-1');
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.execute('')).rejects.toThrow(ValidationException);
    });

    it('should throw UnitNotFoundException when admin not found', async () => {
      adminRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        UnitNotFoundException,
      );
    });

    it('should throw DatabaseException on repository error', async () => {
      adminRepository.findById.mockResolvedValue(mockAdmin);
      adminRepository.delete.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('admin-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
