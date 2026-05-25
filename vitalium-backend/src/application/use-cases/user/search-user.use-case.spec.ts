import { Test, TestingModule } from '@nestjs/testing';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { SearchUserUseCase } from './search-user.use-case';

describe('SearchUserUseCase', () => {
  let useCase: SearchUserUseCase;
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
        SearchUserUseCase,
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

    useCase = module.get<SearchUserUseCase>(SearchUserUseCase);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await useCase.findById('user-id-1');

      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw ValidationException when id is empty', async () => {
      await expect(useCase.findById('')).rejects.toThrow(ValidationException);
    });

    it('should throw UserNotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await useCase.findByEmail('joao@example.com');

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'joao@example.com',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ValidationException when email is empty', async () => {
      await expect(useCase.findByEmail('')).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw ValidationException when email format is invalid', async () => {
      await expect(useCase.findByEmail('not-an-email')).rejects.toThrow(
        ValidationException,
      );
    });

    it('should throw UserNotFoundException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.findByEmail('notfound@example.com')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
