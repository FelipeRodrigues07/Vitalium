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
  CreatePatientCaregiverUseCase,
  DeactivatePatientCaregiverUseCase,
  DeletePatientCaregiverUseCase,
  SearchPatientCaregiverUseCase,
} from '../../../application/use-cases/patient-caregiver/patient-caregiver.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiPatientCaregiverOperations } from '../../../shared/swagger/decorators/patient-caregiver.decorators';
import { CreatePatientCaregiverDTO } from '../../dto/patientCaregiverDTO/create-patient-caregiver.dto';
import { PatientCaregiverResponseDTO } from '../../dto/patientCaregiverDTO/response/patient-caregiver-response.dto';

@ApiTags('patient-caregivers')
@Controller('patient-caregivers')
@UseGuards(AuthGuard, RolesGuard)
export class PatientCaregiverController {
  constructor(
    private readonly createUseCase: CreatePatientCaregiverUseCase,
    private readonly searchUseCase: SearchPatientCaregiverUseCase,
    private readonly deactivateUseCase: DeactivatePatientCaregiverUseCase,
    private readonly deleteUseCase: DeletePatientCaregiverUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPatientCaregiverOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreatePatientCaregiverDTO,
  ): Promise<PatientCaregiverResponseDTO> {
    const link = await this.createUseCase.execute(dto);
    return plainToInstance(PatientCaregiverResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientCaregiverOperations.findByPatient()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<PatientCaregiverResponseDTO[]> {
    const links = await this.searchUseCase.findByPatientId(patientId);
    return plainToInstance(PatientCaregiverResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('caregiver/:caregiverId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientCaregiverOperations.findByCaregiver()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByCaregiver(
    @Param('caregiverId') caregiverId: string,
  ): Promise<PatientCaregiverResponseDTO[]> {
    const links = await this.searchUseCase.findByCaregiverId(caregiverId);
    return plainToInstance(PatientCaregiverResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientCaregiverOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<PatientCaregiverResponseDTO> {
    const link = await this.searchUseCase.findById(id);
    return plainToInstance(PatientCaregiverResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiPatientCaregiverOperations.deactivate()
  @Roles(Role.ADMIN)
  async deactivate(
    @Param('id') id: string,
  ): Promise<PatientCaregiverResponseDTO> {
    const link = await this.deactivateUseCase.execute(id);
    return plainToInstance(PatientCaregiverResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPatientCaregiverOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
