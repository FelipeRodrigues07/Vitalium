import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './login.use-case';
import { Role } from '../../../shared/enums/role.enum';
import type { IAuthRepository } from '../../../domain/interfaces/repositories/auth/auth.repository.interface';

jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authRepository: jest.Mocked<IAuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-id-1',
    email: 'joao@example.com',
    password: 'hashedPassword123',
    firstName: 'João',
    lastName: 'Silva',
    isActive: true,
    role: Role.DOCTOR,
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
        LoginUseCase,
        {
          provide: 'IAuthRepository',
          useValue: {
            findByEmailWithOutPassword: jest.fn(),
            findByIdWithRefreshToken: jest.fn(),
            findAdminContextByUserId: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    authRepository = module.get('IAuthRepository');
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const validDTO = {
      email: 'joao@example.com',
      password: 'Password123!',
    };

    it('should login successfully and return tokens', async () => {
      authRepository.findByEmailWithOutPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('access-token-123')
        .mockReturnValueOnce('refresh-token-456');
      authRepository.updateRefreshToken.mockResolvedValue(undefined);

      const result = await useCase.execute(validDTO);

      expect(authRepository.findByEmailWithOutPassword).toHaveBeenCalledWith(
        validDTO.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validDTO.password,
        mockUser.password,
      );
      expect(authRepository.updateRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBe('access-token-123');
      expect(result.refreshToken).toBe('refresh-token-456');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      authRepository.findByEmailWithOutPassword.mockResolvedValue(null);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      authRepository.findByEmailWithOutPassword.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      authRepository.findByEmailWithOutPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(useCase.execute(validDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should sign access token with correct payload', async () => {
      authRepository.findByEmailWithOutPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');
      authRepository.updateRefreshToken.mockResolvedValue(undefined);

      await useCase.execute(validDTO);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
        expect.objectContaining({ expiresIn: '60m' }),
      );
    });

    it('should sign refresh token with type refresh', async () => {
      authRepository.findByEmailWithOutPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('token');
      authRepository.updateRefreshToken.mockResolvedValue(undefined);

      await useCase.execute(validDTO);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, type: 'refresh' }),
        expect.objectContaining({ expiresIn: '7d' }),
      );
    });
  });
});
