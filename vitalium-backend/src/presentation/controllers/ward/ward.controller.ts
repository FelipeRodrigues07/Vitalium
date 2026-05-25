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
  CreateWardUseCase,
  DeleteWardUseCase,
  SearchWardUseCase,
  UpdateWardUseCase,
} from '../../../application/use-cases/ward/ward.use-cases';
import {
  CreateWardAdmissionUseCase,
  DeleteWardAdmissionUseCase,
  SearchWardAdmissionUseCase,
  UpdateWardAdmissionUseCase,
} from '../../../application/use-cases/ward/ward-admission.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import {
  ApiWardAdmissionOperations,
  ApiWardOperations,
} from '../../../shared/swagger/decorators/ward.decorators';
import { CreateWardAdmissionDTO } from '../../dto/wardAdmissionDTO/create-ward-admission.dto';
import { WardAdmissionResponseDTO } from '../../dto/wardAdmissionDTO/response/ward-admission-response.dto';
import { UpdateWardAdmissionDTO } from '../../dto/wardAdmissionDTO/update-ward-admission.dto';
import { CreateWardDTO } from '../../dto/wardDTO/create-ward.dto';
import { WardResponseDTO } from '../../dto/wardDTO/response/ward-response.dto';
import { UpdateWardDTO } from '../../dto/wardDTO/update-ward.dto';

@ApiTags('wards')
@Controller('wards')
@UseGuards(AuthGuard, RolesGuard)
export class WardController {
  constructor(
    private readonly createWardUseCase: CreateWardUseCase,
    private readonly searchWardUseCase: SearchWardUseCase,
    private readonly updateWardUseCase: UpdateWardUseCase,
    private readonly deleteWardUseCase: DeleteWardUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiWardOperations.create()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateWardDTO): Promise<WardResponseDTO> {
    const ward = await this.createWardUseCase.execute(dto);
    return plainToInstance(WardResponseDTO, ward, {
      excludeExtraneousValues: true,
    });
  }

  @Get('unit/:unitId')
  @HttpCode(HttpStatus.OK)
  @ApiWardOperations.findByUnit()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByUnit(
    @Param('unitId') unitId: string,
  ): Promise<WardResponseDTO[]> {
    const wards = await this.searchWardUseCase.findByUnitId(unitId);
    return plainToInstance(WardResponseDTO, wards, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiWardOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<WardResponseDTO> {
    const ward = await this.searchWardUseCase.findById(id);
    return plainToInstance(WardResponseDTO, ward, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiWardOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWardDTO,
  ): Promise<WardResponseDTO> {
    const ward = await this.updateWardUseCase.execute(id, dto);
    return plainToInstance(WardResponseDTO, ward, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiWardOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteWardUseCase.execute(id);
  }
}

@ApiTags('ward-admissions')
@Controller('ward-admissions')
@UseGuards(AuthGuard, RolesGuard)
export class WardAdmissionController {
  constructor(
    private readonly createWardAdmissionUseCase: CreateWardAdmissionUseCase,
    private readonly searchWardAdmissionUseCase: SearchWardAdmissionUseCase,
    private readonly updateWardAdmissionUseCase: UpdateWardAdmissionUseCase,
    private readonly deleteWardAdmissionUseCase: DeleteWardAdmissionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiWardAdmissionOperations.create()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async create(
    @Body() dto: CreateWardAdmissionDTO,
  ): Promise<WardAdmissionResponseDTO> {
    const admission = await this.createWardAdmissionUseCase.execute(dto);
    return plainToInstance(WardAdmissionResponseDTO, admission, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiWardAdmissionOperations.findByPatient()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<WardAdmissionResponseDTO[]> {
    const admissions =
      await this.searchWardAdmissionUseCase.findByPatientId(patientId);
    return plainToInstance(WardAdmissionResponseDTO, admissions, {
      excludeExtraneousValues: true,
    });
  }

  @Get('ward/:wardId')
  @HttpCode(HttpStatus.OK)
  @ApiWardAdmissionOperations.findByWard()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  async findByWard(
    @Param('wardId') wardId: string,
  ): Promise<WardAdmissionResponseDTO[]> {
    const admissions =
      await this.searchWardAdmissionUseCase.findByWardId(wardId);
    return plainToInstance(WardAdmissionResponseDTO, admissions, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiWardAdmissionOperations.findById()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<WardAdmissionResponseDTO> {
    const admission = await this.searchWardAdmissionUseCase.findById(id);
    return plainToInstance(WardAdmissionResponseDTO, admission, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiWardAdmissionOperations.update()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWardAdmissionDTO,
  ): Promise<WardAdmissionResponseDTO> {
    const admission = await this.updateWardAdmissionUseCase.execute(id, dto);
    return plainToInstance(WardAdmissionResponseDTO, admission, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiWardAdmissionOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteWardAdmissionUseCase.execute(id);
  }
}
