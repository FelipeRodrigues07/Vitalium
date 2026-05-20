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
import { plainToInstance } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiDoctorSpecializationOperations } from '../../../shared/swagger/decorators/doctor-specialization.decorators';
import { CreateDoctorSpecializationDTO } from '../../dto/doctor-specializationDTO/create-doctor-specialization.dto';
import { DoctorSpecializationResponseDTO } from '../../dto/doctor-specializationDTO/response/doctor-specialization-response.dto';
import { CreateDoctorSpecializationUseCase } from '../../../application/use-cases/doctor-specialization/create-doctor-specialization.use-case';
import { SearchDoctorSpecializationUseCase } from '../../../application/use-cases/doctor-specialization/search-doctor-specialization.use-case';
import { DeleteDoctorSpecializationUseCase } from '../../../application/use-cases/doctor-specialization/delete-doctor-specialization.use-case';

@ApiTags('doctor-specializations')
@Controller('doctor-specializations')
@UseGuards(AuthGuard, RolesGuard)
export class DoctorSpecializationController {
  constructor(
    private readonly createDoctorSpecializationUseCase: CreateDoctorSpecializationUseCase,
    private readonly searchDoctorSpecializationUseCase: SearchDoctorSpecializationUseCase,
    private readonly deleteDoctorSpecializationUseCase: DeleteDoctorSpecializationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiDoctorSpecializationOperations.createDoctorSpecialization()
  @Roles(Role.ADMIN)
  async create(
    @Body() createDoctorSpecializationDTO: CreateDoctorSpecializationDTO,
  ): Promise<DoctorSpecializationResponseDTO> {
    const doctorSpecialization =
      await this.createDoctorSpecializationUseCase.execute(
        createDoctorSpecializationDTO,
      );

    return plainToInstance(
      DoctorSpecializationResponseDTO,
      doctorSpecialization,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorSpecializationOperations.findDoctorSpecializationsByDoctorId()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByDoctorId(
    @Param('doctorId') doctorId: string,
  ): Promise<DoctorSpecializationResponseDTO[]> {
    const doctorSpecializations =
      await this.searchDoctorSpecializationUseCase.findByDoctorId(doctorId);

    return plainToInstance(
      DoctorSpecializationResponseDTO,
      doctorSpecializations,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Get('specialization/:specializationId')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorSpecializationOperations.findDoctorSpecializationsBySpecializationId()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findBySpecializationId(
    @Param('specializationId') specializationId: string,
  ): Promise<DoctorSpecializationResponseDTO[]> {
    const doctorSpecializations =
      await this.searchDoctorSpecializationUseCase.findBySpecializationId(
        specializationId,
      );

    return plainToInstance(
      DoctorSpecializationResponseDTO,
      doctorSpecializations,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDoctorSpecializationOperations.deleteDoctorSpecialization()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteDoctorSpecializationUseCase.execute(id);
  }
}
