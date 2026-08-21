import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../../application/use-cases/user/create-user.use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/user/delete-user.use-case';
import { SearchUserUseCase } from '../../../application/use-cases/user/search-user.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/user/update-user.use-case';
import { Role } from '../../../shared/enums/role.enum';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateUserDTO } from '../../dto/userDTO/create-user.dto';
import { UserController } from './user.controller';

describe('UserController', () => {
  let controller: UserController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;

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
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SearchUserUseCase,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUserUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserController>(UserController);
    createUserUseCase = module.get(CreateUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDTO: CreateUserDTO = {
      email: 'joao@example.com',
      password: 'TestPassword123!',
      firstName: 'João',
      lastName: 'Silva',
      phone: '11999999999',
      avatar: 'https://example.com/avatar.jpg',
      isActive: true,
      role: Role.PATIENT,
    };

    it('should create a user successfully', async () => {
      createUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.create(
        { user: { role: Role.ADMIN } } as never,
        createUserDTO,
      );

      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDTO);
      expect(result).toBeDefined();
      expect(result.email).toBe(mockUser.email);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.id).toBe(mockUser.id);
    });

    it('should not return password in response', async () => {
      createUserUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.create(
        { user: { role: Role.ADMIN } } as never,
        createUserDTO,
      );

      expect(result.password).toBeUndefined();
    });

    it('should create a user without optional fields', async () => {
      const minimalDTO: CreateUserDTO = {
        email: 'maria@example.com',
        password: 'TestPassword123!',
        firstName: 'Maria',
        lastName: 'Santos',
        isActive: true,
        role: Role.DOCTOR,
      };

      const minimalUser = {
        ...mockUser,
        id: 'user-id-2',
        email: 'maria@example.com',
        firstName: 'Maria',
        lastName: 'Santos',
        phone: undefined,
        avatar: undefined,
        role: Role.DOCTOR,
      };

      createUserUseCase.execute.mockResolvedValue(minimalUser);

      const result = await controller.create(
        { user: { role: Role.ADMIN } } as never,
        minimalDTO,
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('maria@example.com');
    });

    it('should propagate ConflictException for duplicate email', async () => {
      createUserUseCase.execute.mockRejectedValue(
        new ConflictException('Email já está em uso'),
      );

      await expect(
        controller.create({ user: { role: Role.ADMIN } } as never, createUserDTO),
      ).rejects.toThrow(
        ConflictException,
      );
    });

    it('should propagate errors from use case', async () => {
      createUserUseCase.execute.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(
        controller.create({ user: { role: Role.ADMIN } } as never, createUserDTO),
      ).rejects.toThrow(
        'Unexpected error',
      );
    });
  });
});
