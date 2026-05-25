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
  CreateNurseUnitUseCase,
  DeleteNurseUnitUseCase,
  SearchNurseUnitUseCase,
  UpdateNurseUnitUseCase,
} from '../../../application/use-cases/nurse/nurse-unit.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiNurseUnitOperations } from '../../../shared/swagger/decorators/nurse.decorators';
import { CreateNurseUnitDTO } from '../../dto/nurseUnitDTO/create-nurse-unit.dto';
import { NurseUnitResponseDTO } from '../../dto/nurseUnitDTO/response/nurse-unit-response.dto';
import { UpdateNurseUnitDTO } from '../../dto/nurseUnitDTO/update-nurse-unit.dto';

@ApiTags('nurse-units')
@Controller('nurse-units')
@UseGuards(AuthGuard, RolesGuard)
export class NurseUnitController {
  constructor(
    private readonly createUseCase: CreateNurseUnitUseCase,
    private readonly searchUseCase: SearchNurseUnitUseCase,
    private readonly updateUseCase: UpdateNurseUnitUseCase,
    private readonly deleteUseCase: DeleteNurseUnitUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiNurseUnitOperations.create()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateNurseUnitDTO): Promise<NurseUnitResponseDTO> {
    const link = await this.createUseCase.execute(dto);
    return plainToInstance(NurseUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Get('nurse/:nurseId')
  @HttpCode(HttpStatus.OK)
  @ApiNurseUnitOperations.findByNurse()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByNurse(
    @Param('nurseId') nurseId: string,
  ): Promise<NurseUnitResponseDTO[]> {
    const links = await this.searchUseCase.findByNurseId(nurseId);
    return plainToInstance(NurseUnitResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('unit/:unitId')
  @HttpCode(HttpStatus.OK)
  @ApiNurseUnitOperations.findByUnit()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findByUnit(
    @Param('unitId') unitId: string,
  ): Promise<NurseUnitResponseDTO[]> {
    const links = await this.searchUseCase.findByUnitId(unitId);
    return plainToInstance(NurseUnitResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiNurseUnitOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findById(@Param('id') id: string): Promise<NurseUnitResponseDTO> {
    const link = await this.searchUseCase.findById(id);
    return plainToInstance(NurseUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiNurseUnitOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNurseUnitDTO,
  ): Promise<NurseUnitResponseDTO> {
    const link = await this.updateUseCase.execute(id, dto);
    return plainToInstance(NurseUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNurseUnitOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
