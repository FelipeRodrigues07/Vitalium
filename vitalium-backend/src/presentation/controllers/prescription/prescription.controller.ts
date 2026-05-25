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
import { CreatePrescriptionUseCase } from '../../../application/use-cases/prescription/create-prescription.use-case';
import { DeletePrescriptionUseCase } from '../../../application/use-cases/prescription/delete-prescription.use-case';
import { SearchPrescriptionUseCase } from '../../../application/use-cases/prescription/search-prescription.use-case';
import { UpdatePrescriptionUseCase } from '../../../application/use-cases/prescription/update-prescription.use-case';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiPrescriptionOperations } from '../../../shared/swagger/decorators/prescription.decorators';
import { CreatePrescriptionDTO } from '../../dto/prescriptionDTO/create-prescription.dto';
import { PrescriptionResponseDTO } from '../../dto/prescriptionDTO/response/prescription-response.dto';
import { UpdatePrescriptionDTO } from '../../dto/prescriptionDTO/update-prescription.dto';

@ApiTags('prescriptions')
@Controller('prescriptions')
@UseGuards(AuthGuard, RolesGuard)
export class PrescriptionController {
  constructor(
    private readonly createPrescriptionUseCase: CreatePrescriptionUseCase,
    private readonly searchPrescriptionUseCase: SearchPrescriptionUseCase,
    private readonly updatePrescriptionUseCase: UpdatePrescriptionUseCase,
    private readonly deletePrescriptionUseCase: DeletePrescriptionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiPrescriptionOperations.create()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async create(
    @Body() dto: CreatePrescriptionDTO,
  ): Promise<PrescriptionResponseDTO> {
    const prescription = await this.createPrescriptionUseCase.execute(dto);
    return plainToInstance(PrescriptionResponseDTO, prescription, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiPrescriptionOperations.findByPatient()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE, Role.PATIENT)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<PrescriptionResponseDTO[]> {
    const prescriptions =
      await this.searchPrescriptionUseCase.findByPatientId(patientId);
    return plainToInstance(PrescriptionResponseDTO, prescriptions, {
      excludeExtraneousValues: true,
    });
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiPrescriptionOperations.findByDoctor()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<PrescriptionResponseDTO[]> {
    const prescriptions =
      await this.searchPrescriptionUseCase.findByDoctorId(doctorId);
    return plainToInstance(PrescriptionResponseDTO, prescriptions, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPrescriptionOperations.findById()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE, Role.PATIENT)
  async findOne(@Param('id') id: string): Promise<PrescriptionResponseDTO> {
    const prescription = await this.searchPrescriptionUseCase.findById(id);
    return plainToInstance(PrescriptionResponseDTO, prescription, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiPrescriptionOperations.update()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDTO,
  ): Promise<PrescriptionResponseDTO> {
    const prescription = await this.updatePrescriptionUseCase.execute(id, dto);
    return plainToInstance(PrescriptionResponseDTO, prescription, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiPrescriptionOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deletePrescriptionUseCase.execute(id);
  }
}
