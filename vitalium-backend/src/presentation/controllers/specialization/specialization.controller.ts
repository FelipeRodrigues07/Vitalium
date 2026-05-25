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
<<<<<<< HEAD
  Query,
=======
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiSpecializationOperations } from '../../../shared/swagger/decorators/specialization.decorators';
<<<<<<< HEAD
import { SpecializationResponseDTO } from '../../dto/specializationDTO/response/specialization-response.dto';
import { CreateSpecializationDTO } from '../../dto/specializationDTO/create-specialization.dto';
import { UpdateSpecializationDTO } from '../../dto/specializationDTO/update-specialization.dto';
import {
  CreateSpecializationUseCase,
  SearchSpecializationUseCase,
  UpdateSpecializationUseCase,
  DeleteSpecializationUseCase,
} from '../../../application/use-cases/specialization/specialization.use-cases';
=======
import { CreateSpecializationDTO } from '../../dto/specializationDTO/create-specialization.dto';
import { UpdateSpecializationDTO } from '../../dto/specializationDTO/update-specialization.dto';
import { SpecializationResponseDTO } from '../../dto/specializationDTO/response/specialization-response.dto';
import { CreateSpecializationUseCase } from '../../../application/use-cases/specialization/create-specialization.use-case';
import { SearchSpecializationUseCase } from '../../../application/use-cases/specialization/search-specialization.use-case';
import { UpdateSpecializationUseCase } from '../../../application/use-cases/specialization/update-specialization.use-case';
import { DeleteSpecializationUseCase } from '../../../application/use-cases/specialization/delete-specialization.use-case';
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a

@ApiTags('specializations')
@Controller('specializations')
@UseGuards(AuthGuard, RolesGuard)
export class SpecializationController {
  constructor(
<<<<<<< HEAD
    private readonly createUseCase: CreateSpecializationUseCase,
    private readonly searchUseCase: SearchSpecializationUseCase,
    private readonly updateUseCase: UpdateSpecializationUseCase,
    private readonly deleteUseCase: DeleteSpecializationUseCase,
=======
    private readonly createSpecializationUseCase: CreateSpecializationUseCase,
    private readonly searchSpecializationUseCase: SearchSpecializationUseCase,
    private readonly updateSpecializationUseCase: UpdateSpecializationUseCase,
    private readonly deleteSpecializationUseCase: DeleteSpecializationUseCase,
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
<<<<<<< HEAD
  @ApiSpecializationOperations.create()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreateSpecializationDTO,
  ): Promise<SpecializationResponseDTO> {
    const spec = await this.createUseCase.execute(dto);
    return plainToInstance(SpecializationResponseDTO, spec, {
=======
  @ApiSpecializationOperations.createSpecialization()
  @Roles(Role.ADMIN)
  async create(
    @Body() createSpecializationDTO: CreateSpecializationDTO,
  ): Promise<SpecializationResponseDTO> {
    const specialization = await this.createSpecializationUseCase.execute(
      createSpecializationDTO,
    );

    return plainToInstance(SpecializationResponseDTO, specialization, {
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
<<<<<<< HEAD
  @ApiSpecializationOperations.findAll()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findAll(
    @Query('isActive') isActive?: string,
  ): Promise<SpecializationResponseDTO[]> {
    const filter = isActive !== undefined ? isActive === 'true' : undefined;
    const specs = await this.searchUseCase.findAll(filter);
    return plainToInstance(SpecializationResponseDTO, specs, {
=======
  @ApiSpecializationOperations.findAllSpecializations()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findAll(): Promise<SpecializationResponseDTO[]> {
    const specializations = await this.searchSpecializationUseCase.findAll();

    return plainToInstance(SpecializationResponseDTO, specializations, {
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
<<<<<<< HEAD
  @ApiSpecializationOperations.findById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findById(@Param('id') id: string): Promise<SpecializationResponseDTO> {
    const spec = await this.searchUseCase.findById(id);
    return plainToInstance(SpecializationResponseDTO, spec, {
=======
  @ApiSpecializationOperations.findSpecializationById()
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  async findOne(@Param('id') id: string): Promise<SpecializationResponseDTO> {
    const specialization = await this.searchSpecializationUseCase.findById(id);

    return plainToInstance(SpecializationResponseDTO, specialization, {
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
<<<<<<< HEAD
  @ApiSpecializationOperations.update()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSpecializationDTO,
  ): Promise<SpecializationResponseDTO> {
    const spec = await this.updateUseCase.execute(id, dto);
    return plainToInstance(SpecializationResponseDTO, spec, {
=======
  @ApiSpecializationOperations.updateSpecialization()
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateSpecializationDTO: UpdateSpecializationDTO,
  ): Promise<SpecializationResponseDTO> {
    const specialization = await this.updateSpecializationUseCase.execute(
      id,
      updateSpecializationDTO,
    );

    return plainToInstance(SpecializationResponseDTO, specialization, {
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
<<<<<<< HEAD
  @ApiSpecializationOperations.delete()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteUseCase.execute(id);
=======
  @ApiSpecializationOperations.deleteSpecialization()
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteSpecializationUseCase.execute(id);
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  }
}
