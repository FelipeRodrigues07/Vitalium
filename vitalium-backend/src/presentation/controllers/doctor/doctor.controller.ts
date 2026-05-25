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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateDoctorUseCase } from '../../../application/use-cases/doctor/create-doctor.use-case';
import { DeleteDoctorUseCase } from '../../../application/use-cases/doctor/delete-doctor.use-case';
import { SearchDoctorUseCase } from '../../../application/use-cases/doctor/search-doctor.use-case';
import { UpdateDoctorUseCase } from '../../../application/use-cases/doctor/update-doctor.use-case';
import { CreateDoctorDTO } from '../../../presentation/dto/doctorDTO/create-doctor.dto';
import { DoctorResponseDTO } from '../../../presentation/dto/doctorDTO/response/doctor-response.dto';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiDoctorOperations } from '../../../shared/swagger/decorators';
import { UpdateDoctorDTO } from '../../dto/doctorDTO/update-doctor.dto';

@ApiTags('doctors')
@Controller('doctors')
@UseGuards(AuthGuard, RolesGuard)
export class DoctorController {
  constructor(
    private readonly createDoctorUseCase: CreateDoctorUseCase,
    private readonly searchDoctorUseCase: SearchDoctorUseCase,
    private readonly updateDoctorUseCase: UpdateDoctorUseCase,
    private readonly deleteDoctorUseCase: DeleteDoctorUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiDoctorOperations.createDoctor()
  @Roles(Role.ADMIN)
  async create(
    @Body() createDoctorDTO: CreateDoctorDTO,
  ): Promise<DoctorResponseDTO> {
    const doctor = await this.createDoctorUseCase.execute(createDoctorDTO);

    return plainToInstance(DoctorResponseDTO, doctor, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiDoctorOperations.findAllDoctors()
  @Roles(Role.ADMIN, Role.NURSE)
  async findAll(
    @Query('unitId') unitId?: string,
  ): Promise<DoctorResponseDTO[]> {
    const doctors = await this.searchDoctorUseCase.findAll(unitId);

    return plainToInstance(DoctorResponseDTO, doctors, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorOperations.findDoctorById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<DoctorResponseDTO> {
    const doctor = await this.searchDoctorUseCase.findById(id);

    return plainToInstance(DoctorResponseDTO, doctor, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiDoctorOperations.updateDoctor()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async update(
    @Param('id') id: string,
    @Body() updateDoctorDTO: UpdateDoctorDTO,
  ): Promise<DoctorResponseDTO> {
    const doctor = await this.updateDoctorUseCase.execute(id, updateDoctorDTO);

    return plainToInstance(DoctorResponseDTO, doctor, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDoctorOperations.deleteDoctor()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteDoctorUseCase.execute(id);
  }
}
