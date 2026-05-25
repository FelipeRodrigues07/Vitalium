import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from './logout.use-case';
import type { IAuthRepository } from '../../../domain/interfaces/repositories/auth/auth.repository.interface';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let authRepository: jest.Mocked<IAuthRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: 'IAuthRepository',
          useValue: {
            findByEmailWithOutPassword: jest.fn(),
            findByIdWithRefreshToken: jest.fn(),
            updateRefreshToken: jest.fn(),
            clearRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    authRepository = module.get('IAuthRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should clear refresh token on logout', async () => {
      authRepository.clearRefreshToken.mockResolvedValue(undefined);

      await useCase.execute('user-id-1');

      expect(authRepository.clearRefreshToken).toHaveBeenCalledWith('user-id-1');
    });

    it('should complete without error for valid userId', async () => {
      authRepository.clearRefreshToken.mockResolvedValue(undefined);

      await expect(useCase.execute('user-id-1')).resolves.toBeUndefined();
    });
  });
});
