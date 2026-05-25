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
import { ApiAppointmentOperations } from '../../../shared/swagger/decorators/appointment.decorators';
import { AppointmentResponseDTO } from '../../dto/appointmentDTO/response/appointment-response.dto';
import { CreateAppointmentDTO } from '../../dto/appointmentDTO/create-appointment.dto';
import { UpdateAppointmentDTO } from '../../dto/appointmentDTO/update-appointment.dto';
import { CreateAppointmentUseCase } from '../../../application/use-cases/appointment/create-appointment.use-case';
import { SearchAppointmentUseCase } from '../../../application/use-cases/appointment/search-appointment.use-case';
import { UpdateAppointmentUseCase } from '../../../application/use-cases/appointment/update-appointment.use-case';
import { DeleteAppointmentUseCase } from '../../../application/use-cases/appointment/delete-appointment.use-case';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(AuthGuard, RolesGuard)
export class AppointmentController {
  constructor(
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    private readonly searchAppointmentUseCase: SearchAppointmentUseCase,
    private readonly updateAppointmentUseCase: UpdateAppointmentUseCase,
    private readonly deleteAppointmentUseCase: DeleteAppointmentUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAppointmentOperations.create()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async create(
    @Body() dto: CreateAppointmentDTO,
  ): Promise<AppointmentResponseDTO> {
    const appointment = await this.createAppointmentUseCase.execute(dto);
    return plainToInstance(AppointmentResponseDTO, appointment, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiAppointmentOperations.findByPatient()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE, Role.PATIENT)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<AppointmentResponseDTO[]> {
    const appointments =
      await this.searchAppointmentUseCase.findByPatientId(patientId);
    return plainToInstance(AppointmentResponseDTO, appointments, {
      excludeExtraneousValues: true,
    });
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiAppointmentOperations.findByDoctor()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<AppointmentResponseDTO[]> {
    const appointments =
      await this.searchAppointmentUseCase.findByDoctorId(doctorId);
    return plainToInstance(AppointmentResponseDTO, appointments, {
      excludeExtraneousValues: true,
    });
  }

  @Get('unit/:unitId')
  @HttpCode(HttpStatus.OK)
  @ApiAppointmentOperations.findByUnit()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  async findByUnit(
    @Param('unitId') unitId: string,
  ): Promise<AppointmentResponseDTO[]> {
    const appointments =
      await this.searchAppointmentUseCase.findByUnitId(unitId);
    return plainToInstance(AppointmentResponseDTO, appointments, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiAppointmentOperations.findById()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE, Role.PATIENT)
  async findOne(@Param('id') id: string): Promise<AppointmentResponseDTO> {
    const appointment = await this.searchAppointmentUseCase.findById(id);
    return plainToInstance(AppointmentResponseDTO, appointment, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiAppointmentOperations.update()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDTO,
  ): Promise<AppointmentResponseDTO> {
    const appointment = await this.updateAppointmentUseCase.execute(id, dto);
    return plainToInstance(AppointmentResponseDTO, appointment, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiAppointmentOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteAppointmentUseCase.execute(id);
  }
}
