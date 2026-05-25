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
import { plainToInstance } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiNurseOperations } from '../../../shared/swagger/decorators/nurse.decorators';
import { NurseResponseDTO } from '../../dto/nurseDTO/response/nurse-response.dto';
import { CreateNurseDTO } from '../../dto/nurseDTO/create-nurse.dto';
import { UpdateNurseDTO } from '../../dto/nurseDTO/update-nurse.dto';
import {
  CreateNurseUseCase,
  SearchNurseUseCase,
  UpdateNurseUseCase,
  DeleteNurseUseCase,
} from '../../../application/use-cases/nurse/nurse.use-cases';

@ApiTags('nurses')
@Controller('nurses')
@UseGuards(AuthGuard, RolesGuard)
export class NurseController {
  constructor(
    private readonly createUseCase: CreateNurseUseCase,
    private readonly searchUseCase: SearchNurseUseCase,
    private readonly updateUseCase: UpdateNurseUseCase,
    private readonly deleteUseCase: DeleteNurseUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiNurseOperations.create()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateNurseDTO): Promise<NurseResponseDTO> {
    const nurse = await this.createUseCase.execute(dto);
    return plainToInstance(NurseResponseDTO, nurse, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiNurseOperations.findAll()
  @Roles(Role.ADMIN, Role.DOCTOR)
  async findAll(
    @Query('isActive') isActive?: string,
  ): Promise<NurseResponseDTO[]> {
    const filter = isActive !== undefined ? isActive === 'true' : undefined;
    const nurses = await this.searchUseCase.findAll(filter);
    return plainToInstance(NurseResponseDTO, nurses, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiNurseOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findById(@Param('id') id: string): Promise<NurseResponseDTO> {
    const nurse = await this.searchUseCase.findById(id);
    return plainToInstance(NurseResponseDTO, nurse, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiNurseOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateNurseDTO,
  ): Promise<NurseResponseDTO> {
    const nurse = await this.updateUseCase.execute(id, dto);
    return plainToInstance(NurseResponseDTO, nurse, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNurseOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
