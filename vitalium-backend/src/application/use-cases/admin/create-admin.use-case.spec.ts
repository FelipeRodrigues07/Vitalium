import { Test, TestingModule } from '@nestjs/testing';
import type { IAdminRepository } from '../../../domain/interfaces/repositories/admin/admin.repository.interface';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';
import { AdminRole } from '../../../shared/enums/admin-role.enum';
import { Role } from '../../../shared/enums/role.enum';
import { AdminAlreadyExistsException } from '../../../shared/execeptions/admin/admin-already-exists.exception';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { CreateAdminUseCase } from './create-admin.use-case';

describe('CreateAdminUseCase', () => {
  let useCase: CreateAdminUseCase;
  let adminRepository: jest.Mocked<IAdminRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'user-id-1',
    email: 'admin@example.com',
    password: 'hashedPassword123',
    firstName: 'João',
    lastName: 'Admin',
    isActive: true,
    role: Role.ADMIN,
    phone: null,
    avatar: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

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
        CreateAdminUseCase,
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
        {
          provide: 'IUserRepository',
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PrismaProvider,
          useValue: { $transaction: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<CreateAdminUseCase>(CreateAdminUseCase);
    adminRepository = module.get('IAdminRepository');
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      userId: 'user-id-1',
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    };

    it('should create admin successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      adminRepository.findByUserId.mockResolvedValue(null);
      adminRepository.create.mockResolvedValue(mockAdmin);

      const result = await useCase.execute(validDTO);

      expect(userRepository.findById).toHaveBeenCalledWith(validDTO.userId);
      expect(adminRepository.findByUserId).toHaveBeenCalledWith(
        validDTO.userId,
      );
      expect(adminRepository.create).toHaveBeenCalledWith(validDTO);
      expect(result).toEqual(mockAdmin);
    });

    it('should throw ValidationException when userId is missing', async () => {
      const dto = { ...validDTO, userId: '' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when role is missing', async () => {
      const dto = { ...validDTO, role: undefined as any };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw ValidationException when user role is not ADMIN', async () => {
      userRepository.findById.mockResolvedValue({
        ...mockUser,
        role: Role.DOCTOR,
      });

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw AdminAlreadyExistsException when admin already exists for user', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      adminRepository.findByUserId.mockResolvedValue(mockAdmin);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        AdminAlreadyExistsException,
      );
    });

    it('should throw DatabaseException on unexpected repository error', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      adminRepository.findByUserId.mockResolvedValue(null);
      adminRepository.create.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
