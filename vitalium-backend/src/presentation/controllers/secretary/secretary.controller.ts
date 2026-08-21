import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { Request as ExpressRequest } from 'express';
import {
  CreateSecretaryUseCase,
  DeleteSecretaryUseCase,
  SearchSecretaryUseCase,
  UpdateSecretaryUseCase,
} from '../../../application/use-cases/secretary/secretary.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiSecretaryOperations } from '../../../shared/swagger/decorators/secretary.decorators';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import { CreateSecretaryDTO } from '../../dto/secretaryDTO/create-secretary.dto';
import { SecretaryResponseDTO } from '../../dto/secretaryDTO/response/secretary-response.dto';
import { UpdateSecretaryDTO } from '../../dto/secretaryDTO/update-secretary.dto';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('secretaries')
@Controller('secretaries')
@UseGuards(AuthGuard, RolesGuard)
export class SecretaryController {
  constructor(
    private readonly createUseCase: CreateSecretaryUseCase,
    private readonly searchUseCase: SearchSecretaryUseCase,
    private readonly updateUseCase: UpdateSecretaryUseCase,
    private readonly deleteUseCase: DeleteSecretaryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSecretaryOperations.create()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateSecretaryDTO): Promise<SecretaryResponseDTO> {
    const secretary = await this.createUseCase.execute(dto);
    return plainToInstance(SecretaryResponseDTO, secretary, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryOperations.findAll()
  @Roles(Role.ADMIN)
  async findAll(
    @Query('isActive') isActive?: string,
  ): Promise<SecretaryResponseDTO[]> {
    const filter = isActive !== undefined ? isActive === 'true' : undefined;
    const secretaries = await this.searchUseCase.findAll(filter);
    return plainToInstance(SecretaryResponseDTO, secretaries, {
      excludeExtraneousValues: true,
    });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryOperations.findMe()
  @Roles(Role.SECRETARY)
  async findMe(@Request() req: RequestWithUser): Promise<SecretaryResponseDTO> {
    const secretary = await this.searchUseCase.findByUserId(req.user.sub);
    return plainToInstance(SecretaryResponseDTO, secretary, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryOperations.findById()
  @Roles(Role.ADMIN, Role.SECRETARY)
  async findById(@Param('id') id: string): Promise<SecretaryResponseDTO> {
    const secretary = await this.searchUseCase.findById(id);
    return plainToInstance(SecretaryResponseDTO, secretary, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSecretaryDTO,
  ): Promise<SecretaryResponseDTO> {
    const secretary = await this.updateUseCase.execute(id, dto);
    return plainToInstance(SecretaryResponseDTO, secretary, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSecretaryOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
