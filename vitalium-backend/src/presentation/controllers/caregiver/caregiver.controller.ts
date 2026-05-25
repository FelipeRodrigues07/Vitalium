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
import {
  CreateCaregiverUseCase,
  DeleteCaregiverUseCase,
  LinkCaregiverUseCase,
  SearchCaregiverUseCase,
  UpdateCaregiverUseCase,
} from '../../../application/use-cases/caregiver/caregiver.use-cases';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiCaregiverOperations } from '../../../shared/swagger/decorators/caregiver.decorators';
import { CreateCaregiverDTO } from '../../dto/caregiverDTO/create-caregiver.dto';
import { CaregiverResponseDTO } from '../../dto/caregiverDTO/response/caregiver-response.dto';
import { UpdateCaregiverDTO } from '../../dto/caregiverDTO/update-caregiver.dto';

@ApiTags('caregivers')
@Controller('caregivers')
@UseGuards(AuthGuard, RolesGuard)
export class CaregiverController {
  constructor(
    private readonly createCaregiverUseCase: CreateCaregiverUseCase,
    private readonly searchCaregiverUseCase: SearchCaregiverUseCase,
    private readonly updateCaregiverUseCase: UpdateCaregiverUseCase,
    private readonly deleteCaregiverUseCase: DeleteCaregiverUseCase,
    private readonly linkCaregiverUseCase: LinkCaregiverUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCaregiverOperations.create()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateCaregiverDTO): Promise<CaregiverResponseDTO> {
    const caregiver = await this.createCaregiverUseCase.execute(dto);
    return plainToInstance(CaregiverResponseDTO, caregiver, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiCaregiverOperations.findAll()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findAll(): Promise<CaregiverResponseDTO[]> {
    const caregivers = await this.searchCaregiverUseCase.findAll();
    return plainToInstance(CaregiverResponseDTO, caregivers, {
      excludeExtraneousValues: true,
    });
  }

  @Get('patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiCaregiverOperations.findByPatient()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findByPatient(
    @Param('patientId') patientId: string,
  ): Promise<CaregiverResponseDTO[]> {
    const caregivers =
      await this.searchCaregiverUseCase.findByPatientId(patientId);
    return plainToInstance(CaregiverResponseDTO, caregivers, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiCaregiverOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<CaregiverResponseDTO> {
    const caregiver = await this.searchCaregiverUseCase.findById(id);
    return plainToInstance(CaregiverResponseDTO, caregiver, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiCaregiverOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCaregiverDTO,
  ): Promise<CaregiverResponseDTO> {
    const caregiver = await this.updateCaregiverUseCase.execute(id, dto);
    return plainToInstance(CaregiverResponseDTO, caregiver, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCaregiverOperations.delete()
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteCaregiverUseCase.execute(id);
  }

  @Post(':id/patients/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiCaregiverOperations.linkToPatient()
  @Roles(Role.ADMIN)
  async linkToPatient(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
  ): Promise<void> {
    await this.linkCaregiverUseCase.link(id, patientId);
  }

  @Delete(':id/patients/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiCaregiverOperations.unlinkFromPatient()
  @Roles(Role.ADMIN)
  async unlinkFromPatient(
    @Param('id') id: string,
    @Param('patientId') patientId: string,
  ): Promise<void> {
    await this.linkCaregiverUseCase.unlink(id, patientId);
  }
}
