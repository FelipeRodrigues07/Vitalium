import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.use-case';
import { GetAdminUnitsUseCase } from '../../../application/use-cases/auth/get-admin-units.use-case';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { Role } from '../../../shared/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
  let logoutUseCase: jest.Mocked<LogoutUseCase>;

  const mockAuthResponse = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    user: {
      id: 'user-id-1',
      email: 'joao@example.com',
      firstName: 'João',
      lastName: 'Silva',
      role: Role.PATIENT,
    },
  };

  const mockUser = {
    sub: 'user-id-1',
    email: 'joao@example.com',
    firstName: 'João',
    lastName: 'Silva',
    role: Role.PATIENT,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: LoginUseCase, useValue: { execute: jest.fn() } },
        { provide: RefreshTokenUseCase, useValue: { execute: jest.fn() } },
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
        { provide: GetAdminUnitsUseCase, useValue: { execute: jest.fn() } },
        // Override guards for unit tests
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    loginUseCase = module.get(LoginUseCase);
    refreshTokenUseCase = module.get(RefreshTokenUseCase);
    logoutUseCase = module.get(LogoutUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDTO = { email: 'joao@example.com', password: 'Password123!' };

    it('should return access and refresh tokens on success', async () => {
      loginUseCase.execute.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDTO);

      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDTO);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should propagate UnauthorizedException from use case', async () => {
      loginUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      await expect(controller.login(loginDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh', () => {
    const refreshDTO = { refreshToken: 'refresh-token-456' };

    it('should return a new access token on success', async () => {
      refreshTokenUseCase.execute.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const result = await controller.refresh(refreshDTO);

      expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
        refreshDTO.refreshToken,
      );
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should propagate UnauthorizedException from use case', async () => {
      refreshTokenUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Refresh token inválido'),
      );

      await expect(controller.refresh(refreshDTO)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should call logout use case with user id from request', async () => {
      logoutUseCase.execute.mockResolvedValue(undefined);

      const mockRequest = { user: mockUser } as any;
      await controller.logout(mockRequest);

      expect(logoutUseCase.execute).toHaveBeenCalledWith(mockUser.sub);
    });

    it('should return undefined on success', async () => {
      logoutUseCase.execute.mockResolvedValue(undefined);

      const mockRequest = { user: mockUser } as any;
      const result = await controller.logout(mockRequest);

      expect(result).toBeUndefined();
    });
  });

  // ─── profile ─────────────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return the user payload from the request', () => {
      const mockRequest = { user: mockUser } as any;
      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });
});
