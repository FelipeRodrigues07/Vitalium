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
import { ApiMedicalRecordOperations } from '../../../shared/swagger/decorators/medical-record.decorators';
import { MedicalRecordResponseDTO } from '../../dto/medicalRecordDTO/response/medical-record-response.dto';
import { CreateMedicalRecordDTO } from '../../dto/medicalRecordDTO/create-medical-record.dto';
import { UpdateMedicalRecordDTO } from '../../dto/medicalRecordDTO/update-medical-record.dto';
import { CreateMedicalRecordUseCase } from '../../../application/use-cases/medical-record/create-medical-record.use-case';
import { SearchMedicalRecordUseCase } from '../../../application/use-cases/medical-record/search-medical-record.use-case';
import { UpdateMedicalRecordUseCase } from '../../../application/use-cases/medical-record/update-medical-record.use-case';
import { DeleteMedicalRecordUseCase } from '../../../application/use-cases/medical-record/delete-medical-record.use-case';

@ApiTags('medical-records')
@Controller('medical-records')
@UseGuards(AuthGuard, RolesGuard)
export class MedicalRecordController {
  constructor(
    private readonly createMedicalRecordUseCase: CreateMedicalRecordUseCase,
    private readonly searchMedicalRecordUseCase: SearchMedicalRecordUseCase,
    private readonly updateMedicalRecordUseCase: UpdateMedicalRecordUseCase,
    private readonly deleteMedicalRecordUseCase: DeleteMedicalRecordUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMedicalRecordOperations.create()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async create(
    @Body() dto: CreateMedicalRecordDTO,
  ): Promise<MedicalRecordResponseDTO> {
    const record = await this.createMedicalRecordUseCase.execute(dto);
    return plainToInstance(MedicalRecordResponseDTO, record, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiMedicalRecordOperations.findByPatient()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<MedicalRecordResponseDTO[]> {
    const records =
      await this.searchMedicalRecordUseCase.findByPatientId(patientId);
    return plainToInstance(MedicalRecordResponseDTO, records, {
      excludeExtraneousValues: true,
    });
  }

  @Get('doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiMedicalRecordOperations.findByDoctor()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<MedicalRecordResponseDTO[]> {
    const records =
      await this.searchMedicalRecordUseCase.findByDoctorId(doctorId);
    return plainToInstance(MedicalRecordResponseDTO, records, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiMedicalRecordOperations.findById()
  @Roles(Role.DOCTOR, Role.ADMIN, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<MedicalRecordResponseDTO> {
    const record = await this.searchMedicalRecordUseCase.findById(id);
    return plainToInstance(MedicalRecordResponseDTO, record, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiMedicalRecordOperations.update()
  @Roles(Role.DOCTOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDTO,
  ): Promise<MedicalRecordResponseDTO> {
    const record = await this.updateMedicalRecordUseCase.execute(id, dto);
    return plainToInstance(MedicalRecordResponseDTO, record, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiMedicalRecordOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteMedicalRecordUseCase.execute(id);
  }
}
