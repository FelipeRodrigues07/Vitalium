import { Test, TestingModule } from '@nestjs/testing';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { DeleteUserUseCase } from './delete-user.use-case';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'user-id-1',
    email: 'joao@example.com',
    password: 'hashedPassword123',
    firstName: 'João',
    lastName: 'Silva',
    isActive: true,
    role: Role.PATIENT,
    phone: null,
    avatar: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
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
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete user successfully', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);

      await expect(useCase.execute('user-id-1')).resolves.toBeUndefined();

      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(userRepository.delete).toHaveBeenCalledWith('user-id-1');
    });

    it('should throw UserNotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it('should throw DatabaseException on repository delete error', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute('user-id-1')).rejects.toThrow(
        DatabaseException,
      );
    });
  });
});
