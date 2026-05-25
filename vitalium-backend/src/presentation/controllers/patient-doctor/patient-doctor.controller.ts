import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { Request as ExpressRequest } from 'express';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { CreatePatientDoctorUseCase } from '../../../application/use-cases/patient-doctor/create-patient-doctor.use-case';
import { CreatePatientDoctorDTO } from '../../dto/patient-doctor/create-patient-doctor.dto';
import { PatientDoctorResponseDTO } from '../../dto/patientDTO/response/patient-doctor-response.dto';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('patient-doctors')
@Controller('patient-doctors')
@UseGuards(AuthGuard, RolesGuard)
export class PatientDoctorController {
  constructor(
    private readonly createPatientDoctorUseCase: CreatePatientDoctorUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreatePatientDoctorDTO,
    @Request() req: RequestWithUser,
  ): Promise<PatientDoctorResponseDTO> {
    const link = await this.createPatientDoctorUseCase.execute(dto, req.user);

    return plainToInstance(PatientDoctorResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }
}
