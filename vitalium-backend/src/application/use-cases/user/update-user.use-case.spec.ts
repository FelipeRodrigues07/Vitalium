import { Test, TestingModule } from '@nestjs/testing';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { UserNotFoundException } from '../../../shared/execeptions/user/user-not-found.exception';
import { UpdateUserUseCase } from './update-user.use-case';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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
        UpdateUserUseCase,
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

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = { firstName: 'Carlos', phone: '11888888888' };

    it('should update user successfully', async () => {
      const updated = { ...mockUser, ...validDTO };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute('user-id-1', validDTO);

      expect(userRepository.findById).toHaveBeenCalledWith('user-id-1');
      expect(userRepository.update).toHaveBeenCalledWith('user-id-1', validDTO);
      expect(result.firstName).toBe('Carlos');
    });

    it('should throw UserNotFoundException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute('non-existent-id', validDTO),
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should allow updating isActive field', async () => {
      const dto = { isActive: false };
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await useCase.execute('user-id-1', dto);

      expect(result.isActive).toBe(false);
    });
  });
});
