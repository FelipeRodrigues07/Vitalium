import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IAuthRepository } from '../../../domain/interfaces/repositories/auth/auth.repository.interface';
import type { LoginDTO } from '../../../presentation/dto/authDTO/login.dto';
import type { AuthResponseDTO } from '../../../presentation/dto/authDTO/response/auth-response.dto';
import {
  buildAuthTokenPayload,
  buildAuthUserResponse,
} from '../../../shared/auth/build-auth-token-payload';
import { Role } from '../../../shared/enums/role.enum';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(loginDTO: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.authRepository.findByEmailWithOutPassword(
      loginDTO.email,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo ou desativado');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDTO.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    let adminContext = null;

    if (user.role === Role.ADMIN) {
      adminContext = await this.authRepository.findAdminContextByUserId(
        user.id,
      );

      if (!adminContext) {
        throw new UnauthorizedException(
          'Perfil administrativo não configurado para este usuário',
        );
      }
    }

    const tokenPayload = buildAuthTokenPayload(user, adminContext);

    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '60m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await this.authRepository.updateRefreshToken(
      user.id,
      refreshToken,
      refreshTokenExpiresAt,
    );

    return {
      accessToken,
      refreshToken,
      user: buildAuthUserResponse(user, adminContext),
    };
  }
}
