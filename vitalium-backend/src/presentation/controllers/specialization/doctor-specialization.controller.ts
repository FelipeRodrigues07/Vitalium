import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import {
  CreateDoctorSpecializationUseCase,
  DeleteDoctorSpecializationUseCase,
  SearchDoctorSpecializationUseCase,
} from '../../../application/use-cases/specialization/doctor-specialization.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiDoctorSpecializationOperations } from '../../../shared/swagger/decorators/specialization.decorators';
import { CreateDoctorSpecializationDTO } from '../../dto/doctorSpecializationDTO/create-doctor-specialization.dto';
import { DoctorSpecializationResponseDTO } from '../../dto/doctorSpecializationDTO/response/doctor-specialization-response.dto';

@ApiTags('doctor-specializations')
@Controller('doctor-specializations')
@UseGuards(AuthGuard, RolesGuard)
export class DoctorSpecializationController {
  constructor(
    private readonly createUseCase: CreateDoctorSpecializationUseCase,
    private readonly searchUseCase: SearchDoctorSpecializationUseCase,
    private readonly deleteUseCase: DeleteDoctorSpecializationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiDoctorSpecializationOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecializationResponseDTO> {
    const link = await this.createUseCase.execute(dto);
    return plainToInstance(DoctorSpecializationResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorSpecializationOperations.findByDoctor()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<DoctorSpecializationResponseDTO[]> {
    const links = await this.searchUseCase.findByDoctorId(doctorId);
    return plainToInstance(DoctorSpecializationResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get('specialization/:specializationId')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorSpecializationOperations.findBySpecialization()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findBySpecialization(
    @Param('specializationId') specializationId: string,
  ): Promise<DoctorSpecializationResponseDTO[]> {
    const links =
      await this.searchUseCase.findBySpecializationId(specializationId);
    return plainToInstance(DoctorSpecializationResponseDTO, links, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorSpecializationOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findById(
    @Param('id') id: string,
  ): Promise<DoctorSpecializationResponseDTO> {
    const link = await this.searchUseCase.findById(id);
    return plainToInstance(DoctorSpecializationResponseDTO, link, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDoctorSpecializationOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
