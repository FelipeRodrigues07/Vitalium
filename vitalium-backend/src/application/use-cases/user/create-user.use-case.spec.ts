import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { IUserRepository } from '../../../domain/interfaces/repositories/user/user.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { DatabaseException } from '../../../shared/execeptions/system/database.exception';
import { ValidationException } from '../../../shared/execeptions/system/validation.exception';
import { CreateUserUseCase } from './create-user.use-case';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockUser = {
    id: 'user-id-1',
    email: 'joao@example.com',
    password: 'hashedPassword123',
    firstName: 'João',
    lastName: 'Silva',
    phone: '11999999999',
    avatar: 'https://example.com/avatar.jpg',
    isActive: true,
    role: Role.PATIENT,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
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

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get('IUserRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      email: 'joao@example.com',
      password: 'TestPassword123!',
      firstName: 'João',
      lastName: 'Silva',
      phone: '11999999999',
      isActive: true,
      role: Role.PATIENT,
    };

    it('should create a user successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await useCase.execute(validDTO);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(validDTO.email);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validDTO.email,
          firstName: validDTO.firstName,
          lastName: validDTO.lastName,
          phone: validDTO.phone,
          role: validDTO.role,
          isActive: validDTO.isActive,
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ValidationException when email is missing', async () => {
      const dto = { ...validDTO, email: '' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when email format is invalid', async () => {
      const dto = { ...validDTO, email: 'invalid-email' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when firstName is missing', async () => {
      const dto = { ...validDTO, firstName: '' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when lastName is missing', async () => {
      const dto = { ...validDTO, lastName: '' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when role is missing', async () => {
      const dto = { ...validDTO, role: '' as any };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid role', async () => {
      const dto = { ...validDTO, role: 'INVALID_ROLE' as any };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException for invalid phone format', async () => {
      const dto = { ...validDTO, phone: 'invalid-phone!' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when firstName is too short', async () => {
      const dto = { ...validDTO, firstName: 'J' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ValidationException when lastName is too short', async () => {
      const dto = { ...validDTO, lastName: 'S' };

      await expect(useCase.execute(dto)).rejects.toThrow(ValidationException);
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw DatabaseException when repository create fails', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(new Error('DB connection error'));

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        DatabaseException,
      );
    });

    it('should accept valid phone numbers', async () => {
      const dto = { ...validDTO, phone: '+5511999999999' };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        ...mockUser,
        phone: dto.phone,
      });

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
    });
  });
});
