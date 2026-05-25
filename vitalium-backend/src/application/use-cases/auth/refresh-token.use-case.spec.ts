import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import type { IAuthRepository } from '../../../domain/interfaces/repositories/auth/auth.repository.interface';
import { Role } from '../../../shared/enums/role.enum';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
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
    refreshToken: 'valid-refresh-token',
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
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

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    authRepository = module.get('IAuthRepository');
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a new access token for a valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id-1',
        type: 'refresh',
      });
      authRepository.findByIdWithRefreshToken.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await useCase.execute('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: mockUser.id, email: mockUser.email }),
        expect.objectContaining({ expiresIn: '60m' }),
      );
    });

    it('should throw UnauthorizedException when token is empty', async () => {
      await expect(useCase.execute('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt malformed'));

      await expect(useCase.execute('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token type is not refresh', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id-1',
        type: 'access',
      });

      await expect(
        useCase.execute('access-token-used-as-refresh'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id-1',
        type: 'refresh',
      });
      authRepository.findByIdWithRefreshToken.mockResolvedValue(null);

      await expect(useCase.execute('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id-1',
        type: 'refresh',
      });
      authRepository.findByIdWithRefreshToken.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(useCase.execute('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id-1',
        type: 'refresh',
      });
      authRepository.findByIdWithRefreshToken.mockResolvedValue({
        ...mockUser,
        refreshTokenExpiresAt: new Date(Date.now() - 1000),
      });

      await expect(useCase.execute('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when refreshTokenExpiresAt is null', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'user-id-1',
        type: 'refresh',
      });
      authRepository.findByIdWithRefreshToken.mockResolvedValue({
        ...mockUser,
        refreshTokenExpiresAt: null,
      });

      await expect(useCase.execute('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
