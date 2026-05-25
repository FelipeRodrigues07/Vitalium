import {
  Body,
  Controller,
<<<<<<< HEAD
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
=======
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { Request as ExpressRequest } from 'express';
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
<<<<<<< HEAD
import { ApiPatientDoctorOperations } from '../../../shared/swagger/decorators/patient-doctor.decorators';
import { PatientDoctorResponseDTO } from '../../dto/patientDoctorDTO/response/patient-doctor-response.dto';
import { CreatePatientDoctorDTO } from '../../dto/patientDoctorDTO/create-patient-doctor.dto';
import { UpdatePatientDoctorDTO } from '../../dto/patientDoctorDTO/update-patient-doctor.dto';
import {
  CreatePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
  DeletePatientDoctorUseCase,
} from '../../../application/use-cases/patient-doctor/patient-doctor.use-cases';
=======
import { CreatePatientDoctorUseCase } from '../../../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import { CreatePatientDoctorDTO } from '../../dto/patient-doctor/create-patient-doctor.dto';
import { PatientDoctorResponseDTO } from '../../dto/patientDTO/response/patient-doctor-response.dto';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a

@ApiTags('patient-doctors')
@Controller('patient-doctors')
@UseGuards(AuthGuard, RolesGuard)
export class PatientDoctorController {
  constructor(
<<<<<<< HEAD
    private readonly createUseCase: CreatePatientDoctorUseCase,
    private readonly searchUseCase: SearchPatientDoctorUseCase,
    private readonly updateUseCase: UpdatePatientDoctorUseCase,
    private readonly deleteUseCase: DeletePatientDoctorUseCase,
=======
    private readonly createPatientDoctorUseCase: CreatePatientDoctorUseCase,
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
<<<<<<< HEAD
  @ApiPatientDoctorOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreatePatientDoctorDTO,
  ): Promise<PatientDoctorResponseDTO> {
    const link = await this.createUseCase.execute(dto);
=======
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreatePatientDoctorDTO,
    @Request() req: RequestWithUser,
  ): Promise<PatientDoctorResponseDTO> {
    const link = await this.createPatientDoctorUseCase.execute(dto, req.user);

>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
    return plainToInstance(PatientDoctorResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }
<<<<<<< HEAD

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientDoctorOperations.findByPatient()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<PatientDoctorResponseDTO[]> {
    const links = await this.searchUseCase.findByPatientId(patientId);
    return plainToInstance(PatientDoctorResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiPatientDoctorOperations.findByDoctor()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<PatientDoctorResponseDTO[]> {
    const links = await this.searchUseCase.findByDoctorId(doctorId);
    return plainToInstance(PatientDoctorResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientDoctorOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<PatientDoctorResponseDTO> {
    const link = await this.searchUseCase.findById(id);
    return plainToInstance(PatientDoctorResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPatientDoctorOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDoctorDTO,
  ): Promise<PatientDoctorResponseDTO> {
    const link = await this.updateUseCase.execute(id, dto);
    return plainToInstance(PatientDoctorResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPatientDoctorOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
=======
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
}
