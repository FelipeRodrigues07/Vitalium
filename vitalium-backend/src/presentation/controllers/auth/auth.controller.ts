import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../../application/use-cases/auth/logout.use-case';
import { GetAdminUnitsUseCase } from '../../../application/use-cases/auth/get-admin-units.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.use-case';
import { LoginDTO } from '../../dto/authDTO/login.dto';
import { RefreshTokenDTO } from '../../dto/authDTO/refresh-token.dto';
import type { AuthResponseDTO } from '../../dto/authDTO/response/auth-response.dto';
import type { RefreshTokenResponseDTO } from '../../dto/authDTO/response/refresh-token-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { ApiAuthOperations } from '../../../shared/swagger/decorators/auth.decorators';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getAdminUnitsUseCase: GetAdminUnitsUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiAuthOperations.login()
  async login(@Body() loginDTO: LoginDTO): Promise<AuthResponseDTO> {
    return this.loginUseCase.execute(loginDTO);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiAuthOperations.refreshToken()
  async refresh(
    @Body() refreshTokenDTO: RefreshTokenDTO,
  ): Promise<RefreshTokenResponseDTO> {
    return this.refreshTokenUseCase.execute(refreshTokenDTO.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @ApiAuthOperations.logout()
  async logout(@Request() req: RequestWithUser): Promise<void> {
    return this.logoutUseCase.execute(req.user.sub);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiAuthOperations.profile()
  getProfile(@Request() req: RequestWithUser): RequestWithUser['user'] {
    return req.user;
  }

  @Get('units')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getAdminUnits(@Request() req: RequestWithUser) {
    return this.getAdminUnitsUseCase.execute(req.user);
  }
}
