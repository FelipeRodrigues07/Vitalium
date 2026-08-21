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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  CreateSecretaryUnitUseCase,
  DeleteSecretaryUnitUseCase,
  SearchSecretaryUnitUseCase,
  UpdateSecretaryUnitUseCase,
} from '../../../application/use-cases/secretary/secretary-unit.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiSecretaryUnitOperations } from '../../../shared/swagger/decorators/secretary.decorators';
import { CreateSecretaryUnitDTO } from '../../dto/secretaryUnitDTO/create-secretary-unit.dto';
import { SecretaryUnitResponseDTO } from '../../dto/secretaryUnitDTO/response/secretary-unit-response.dto';
import { UpdateSecretaryUnitDTO } from '../../dto/secretaryUnitDTO/update-secretary-unit.dto';

@ApiTags('secretary-units')
@Controller('secretary-units')
@UseGuards(AuthGuard, RolesGuard)
export class SecretaryUnitController {
  constructor(
    private readonly createUseCase: CreateSecretaryUnitUseCase,
    private readonly searchUseCase: SearchSecretaryUnitUseCase,
    private readonly updateUseCase: UpdateSecretaryUnitUseCase,
    private readonly deleteUseCase: DeleteSecretaryUnitUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSecretaryUnitOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreateSecretaryUnitDTO,
  ): Promise<SecretaryUnitResponseDTO> {
    const link = await this.createUseCase.execute(dto);
    return plainToInstance(SecretaryUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Get('secretary/:secretaryId')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryUnitOperations.findBySecretary()
  @Roles(Role.ADMIN, Role.SECRETARY)
  async findBySecretary(
    @Param('secretaryId') secretaryId: string,
  ): Promise<SecretaryUnitResponseDTO[]> {
    const links = await this.searchUseCase.findBySecretaryId(secretaryId);
    return plainToInstance(SecretaryUnitResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('unit/:unitId')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryUnitOperations.findByUnit()
  @Roles(Role.ADMIN)
  async findByUnit(
    @Param('unitId') unitId: string,
  ): Promise<SecretaryUnitResponseDTO[]> {
    const links = await this.searchUseCase.findByUnitId(unitId);
    return plainToInstance(SecretaryUnitResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryUnitOperations.findById()
  @Roles(Role.ADMIN, Role.SECRETARY)
  async findById(@Param('id') id: string): Promise<SecretaryUnitResponseDTO> {
    const link = await this.searchUseCase.findById(id);
    return plainToInstance(SecretaryUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSecretaryUnitOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSecretaryUnitDTO,
  ): Promise<SecretaryUnitResponseDTO> {
    const link = await this.updateUseCase.execute(id, dto);
    return plainToInstance(SecretaryUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSecretaryUnitOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
