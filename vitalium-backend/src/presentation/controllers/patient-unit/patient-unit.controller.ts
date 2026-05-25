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
import { plainToInstance } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiPatientUnitOperations } from '../../../shared/swagger/decorators/patient-unit.decorators';
import { PatientUnitResponseDTO } from '../../dto/patientUnitDTO/response/patient-unit-response.dto';
import { CreatePatientUnitDTO } from '../../dto/patientUnitDTO/create-patient-unit.dto';
import { UpdatePatientUnitDTO } from '../../dto/patientUnitDTO/update-patient-unit.dto';
import {
  CreatePatientUnitUseCase,
  SearchPatientUnitUseCase,
  UpdatePatientUnitUseCase,
  DeletePatientUnitUseCase,
} from '../../../application/use-cases/patient-unit/patient-unit.use-cases';

@ApiTags('patient-units')
@Controller('patient-units')
@UseGuards(AuthGuard, RolesGuard)
export class PatientUnitController {
  constructor(
    private readonly createUseCase: CreatePatientUnitUseCase,
    private readonly searchUseCase: SearchPatientUnitUseCase,
    private readonly updateUseCase: UpdatePatientUnitUseCase,
    private readonly deleteUseCase: DeletePatientUnitUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPatientUnitOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreatePatientUnitDTO,
  ): Promise<PatientUnitResponseDTO> {
    const link = await this.createUseCase.execute(dto);
    return plainToInstance(PatientUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientUnitOperations.findByPatient()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<PatientUnitResponseDTO[]> {
    const links = await this.searchUseCase.findByPatientId(patientId);
    return plainToInstance(PatientUnitResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('unit/:unitId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientUnitOperations.findByUnit()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByUnit(
    @Param('unitId') unitId: string,
  ): Promise<PatientUnitResponseDTO[]> {
    const links = await this.searchUseCase.findByUnitId(unitId);
    return plainToInstance(PatientUnitResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientUnitOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<PatientUnitResponseDTO> {
    const link = await this.searchUseCase.findById(id);
    return plainToInstance(PatientUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientUnitOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientUnitDTO,
  ): Promise<PatientUnitResponseDTO> {
    const link = await this.updateUseCase.execute(id, dto);
    return plainToInstance(PatientUnitResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPatientUnitOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
