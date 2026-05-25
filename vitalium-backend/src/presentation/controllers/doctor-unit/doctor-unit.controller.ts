import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateDoctorUnitUseCase } from '../../../application/use-cases/doctor-unit/create-doctor-unit.use-case';
import { DeleteDoctorUnitUseCase } from '../../../application/use-cases/doctor-unit/delete-doctor-unit.use-case';
import { UpdateDoctorUnitUseCase } from '../../../application/use-cases/doctor-unit/update-doctor-unit.use-case';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { ApiDoctorUnitOperations } from '../../../shared/swagger/decorators/doctor-unit.decorators';
import { CreateDoctorUnitDTO } from '../../dto/doctor-unitDTO/create-doctor-unit.dto';
import { DoctorUnitResponseDTO } from '../../dto/doctor-unitDTO/response/doctor-unit-reponse.dto';
import { UpdateDoctorUnitDTO } from '../../dto/doctor-unitDTO/update-doctor-unit.dto';

@ApiTags('doctor-units')
@Controller('doctor-units')
@UseGuards(AuthGuard, RolesGuard)
export class DoctorUnitController {
  constructor(
    private readonly createDoctorUnitUseCase: CreateDoctorUnitUseCase,
    private readonly updateDoctorUnitUseCase: UpdateDoctorUnitUseCase,
    private readonly deleteDoctorUnitUseCase: DeleteDoctorUnitUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  @ApiDoctorUnitOperations.createDoctorUnit()
  async create(
    @Body() createDoctorUnitDTO: CreateDoctorUnitDTO,
  ): Promise<DoctorUnitResponseDTO> {
    const doctorUnit =
      await this.createDoctorUnitUseCase.execute(createDoctorUnitDTO);

    return plainToInstance(DoctorUnitResponseDTO, doctorUnit, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiDoctorUnitOperations.updateDoctorUnit()
  async update(
    @Param('id') id: string,
    @Body() updateDoctorUnitDTO: UpdateDoctorUnitDTO,
  ): Promise<DoctorUnitResponseDTO> {
    const doctorUnit = await this.updateDoctorUnitUseCase.execute(
      id,
      updateDoctorUnitDTO,
    );

    return plainToInstance(DoctorUnitResponseDTO, doctorUnit, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN)
  @ApiDoctorUnitOperations.deleteDoctorUnit()
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteDoctorUnitUseCase.execute(id);
  }
}
