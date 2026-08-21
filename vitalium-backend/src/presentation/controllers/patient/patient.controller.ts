import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { CreatePatientUseCase } from '../../../application/use-cases/patient/create-patient.use-case';
import { DeletePatientUseCase } from '../../../application/use-cases/patient/delete-patient.use-case';
import { SearchPatientUseCase } from '../../../application/use-cases/patient/search-patient.use-case';
import { UpdatePatientUseCase } from '../../../application/use-cases/patient/update-patient.use-case';
import { ClinicMembershipService } from '../../../shared/clinic/clinic-membership.service';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiPatientOperations } from '../../../shared/swagger/decorators';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import { CreatePatientDTO } from '../../dto/patientDTO/create-patient.dto';
import { PatientResponseDTO } from '../../dto/patientDTO/response/patient-response.dto';
import { UpdatePatientDTO } from '../../dto/patientDTO/update-patient.dto';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('patients')
@Controller('patients')
@UseGuards(AuthGuard, RolesGuard)
export class PatientController {
  constructor(
    private readonly createPatientUseCase: CreatePatientUseCase,
    private readonly searchPatientUseCase: SearchPatientUseCase,
    private readonly updatePatientUseCase: UpdatePatientUseCase,
    private readonly deletePatientUseCase: DeletePatientUseCase,
    private readonly clinicMembershipService: ClinicMembershipService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPatientOperations.createPatient()
  @Roles(Role.ADMIN, Role.SECRETARY)
  async create(
    @Body() createPatientDTO: CreatePatientDTO,
  ): Promise<PatientResponseDTO> {
    const patient = await this.createPatientUseCase.execute(createPatientDTO);

    return plainToInstance(PatientResponseDTO, patient, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPatientOperations.findAllPatients()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.SECRETARY)
  async findAll(
    @Request() req: RequestWithUser,
    @Query('doctorId') doctorId?: string,
    @Query('unitId') unitId?: string,
  ): Promise<PatientResponseDTO[]> {
    const scopedUnitId = await this.clinicMembershipService.resolveDoctorListUnitId(
      req.user,
      unitId,
    );
    const patients = await this.searchPatientUseCase.findAllForAuthUser(
      req.user,
      doctorId,
      scopedUnitId,
    );

    return plainToInstance(PatientResponseDTO, patients, {
      excludeExtraneousValues: true,
    });
  }

  @Get('by-user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientOperations.findPatientByUserId()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT)
  async findByUserId(
    @Param('userId') userId: string,
    @Request() req: RequestWithUser,
  ): Promise<PatientResponseDTO> {
    if (req.user.role === Role.PATIENT && req.user.sub !== userId) {
      throw new ForbiddenException(
        'Pacientes só podem consultar o próprio perfil',
      );
    }

    const patient = await this.searchPatientUseCase.findByUserId(userId);

    return plainToInstance(PatientResponseDTO, patient, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientOperations.findPatientById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.SECRETARY)
  async findOne(@Param('id') id: string): Promise<PatientResponseDTO> {
    const patient = await this.searchPatientUseCase.findById(id);

    return plainToInstance(PatientResponseDTO, patient, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientOperations.updatePatient()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.SECRETARY)
  async update(
    @Param('id') id: string,
    @Body() updatePatientDTO: UpdatePatientDTO,
  ): Promise<PatientResponseDTO> {
    const patient = await this.updatePatientUseCase.execute(
      id,
      updatePatientDTO,
    );

    return plainToInstance(PatientResponseDTO, patient, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPatientOperations.deletePatient()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deletePatientUseCase.execute(id);
  }
}
