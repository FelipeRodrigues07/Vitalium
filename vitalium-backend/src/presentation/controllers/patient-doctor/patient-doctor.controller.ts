import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreatePatientDoctorUseCase } from '../../../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import {
  DeletePatientDoctorUseCase,
  SearchPatientDoctorUseCase,
  UpdatePatientDoctorUseCase,
} from '../../../application/use-cases/patient-doctor/patient-doctor.use-cases';
import { PrismaProvider } from '../../../infrastructure/database/prisma.provider';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiPatientDoctorOperations } from '../../../shared/swagger/decorators/patient-doctor.decorators';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';
import { CreatePatientDoctorDTO } from '../../dto/patient-doctor/create-patient-doctor.dto';
import { PatientDoctorResponseDTO } from '../../dto/patientDoctorDTO/response/patient-doctor-response.dto';
import { UpdatePatientDoctorDTO } from '../../dto/patientDoctorDTO/update-patient-doctor.dto';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('patient-doctors')
@Controller('patient-doctors')
@UseGuards(AuthGuard, RolesGuard)
export class PatientDoctorController {
  constructor(
    private readonly createUseCase: CreatePatientDoctorUseCase,
    private readonly searchUseCase: SearchPatientDoctorUseCase,
    private readonly updateUseCase: UpdatePatientDoctorUseCase,
    private readonly deleteUseCase: DeletePatientDoctorUseCase,
    private readonly prisma: PrismaProvider,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPatientDoctorOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreatePatientDoctorDTO,
  ): Promise<PatientDoctorResponseDTO> {
    const link = await this.createUseCase.execute(dto, req.user);
    return plainToInstance(PatientDoctorResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

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

  @Get('doctor/by-user/:userId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findByDoctorUserId(
    @Param('userId') userId: string,
  ): Promise<PatientDoctorResponseDTO[]> {
    const doctor = await this.prisma.doctor.findFirst({ where: { userId } });
    if (!doctor)
      throw new NotFoundException('Médico não encontrado para este usuário');
    const links = await this.searchUseCase.findByDoctorId(doctor.id);
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
}
