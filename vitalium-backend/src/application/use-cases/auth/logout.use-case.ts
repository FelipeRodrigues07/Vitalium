import { Inject, Injectable } from '@nestjs/common';
import type { IAuthRepository } from '../../../domain/interfaces/repositories/auth/auth.repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.authRepository.clearRefreshToken(userId);
  }
}
