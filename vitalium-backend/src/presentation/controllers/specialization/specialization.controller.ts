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
import { ApiSpecializationOperations } from '../../../shared/swagger/decorators/specialization.decorators';
import { SpecializationResponseDTO } from '../../dto/specializationDTO/response/specialization-response.dto';
import { CreateSpecializationDTO } from '../../dto/specializationDTO/create-specialization.dto';
import { UpdateSpecializationDTO } from '../../dto/specializationDTO/update-specialization.dto';
import {
  CreateSpecializationUseCase,
  SearchSpecializationUseCase,
  UpdateSpecializationUseCase,
  DeleteSpecializationUseCase,
} from '../../../application/use-cases/specialization/specialization.use-cases';

@ApiTags('specializations')
@Controller('specializations')
@UseGuards(AuthGuard, RolesGuard)
export class SpecializationController {
  constructor(
    private readonly createUseCase: CreateSpecializationUseCase,
    private readonly searchUseCase: SearchSpecializationUseCase,
    private readonly updateUseCase: UpdateSpecializationUseCase,
    private readonly deleteUseCase: DeleteSpecializationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiSpecializationOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreateSpecializationDTO,
  ): Promise<SpecializationResponseDTO> {
    const spec = await this.createUseCase.execute(dto);
    return plainToInstance(SpecializationResponseDTO, spec, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiSpecializationOperations.findAll()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findAll(
    @Query('isActive') isActive?: string,
  ): Promise<SpecializationResponseDTO[]> {
    const filter = isActive !== undefined ? isActive === 'true' : undefined;
    const specs = await this.searchUseCase.findAll(filter);
    return plainToInstance(SpecializationResponseDTO, specs, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSpecializationOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findById(@Param('id') id: string): Promise<SpecializationResponseDTO> {
    const spec = await this.searchUseCase.findById(id);
    return plainToInstance(SpecializationResponseDTO, spec, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSpecializationOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecializationDTO,
  ): Promise<SpecializationResponseDTO> {
    const spec = await this.updateUseCase.execute(id, dto);
    return plainToInstance(SpecializationResponseDTO, spec, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSpecializationOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
  }
}
