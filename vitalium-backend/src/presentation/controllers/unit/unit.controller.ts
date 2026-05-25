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
import { CreateUnitUseCase } from '../../../application/use-cases/unit/create-unit.use-case';
import { DeleteUnitUseCase } from '../../../application/use-cases/unit/delete-unit.use-case';
import { SearchUnitUseCase } from '../../../application/use-cases/unit/search-unit.use-case';
import { UpdateUnitUseCase } from '../../../application/use-cases/unit/update-unit.use-case';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { SuperAdminOnly } from '../../../shared/decorators/super-admin.decorator';
import { Role } from '../../../shared/enums';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { SuperAdminGuard } from '../../../shared/guards/super-admin.guard';
import { ApiUnitOperations } from '../../../shared/swagger/decorators';
import { CreateUnitDTO } from '../../dto/unitDTO/create-unit.dto';
import { ResponseUnitDTO } from '../../dto/unitDTO/response/unit-response.dto';
import { UpdateUnitDTO } from '../../dto/unitDTO/update-unit.dto';

@ApiTags('units')
@Controller('units')
@UseGuards(AuthGuard, RolesGuard, SuperAdminGuard)
@Roles(Role.ADMIN)
@SuperAdminOnly()
export class UnitController {
  constructor(
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly searchUnitUseCase: SearchUnitUseCase,
    private readonly updateUnitUseCase: UpdateUnitUseCase,
    private readonly deleteUnitUseCase: DeleteUnitUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiUnitOperations.createUnit()
  async createUnit(
    @Body() createUnitDTO: CreateUnitDTO,
  ): Promise<ResponseUnitDTO> {
    const unit = await this.createUnitUseCase.execute(createUnitDTO);

    return plainToInstance(ResponseUnitDTO, unit, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiUnitOperations.findUnitById()
  async findUnitById(@Param('id') id: string): Promise<ResponseUnitDTO> {
    const unit = await this.searchUnitUseCase.execute(id);

    return plainToInstance(ResponseUnitDTO, unit, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiUnitOperations.updateUnit()
  async updateUnit(
    @Param('id') id: string,
    @Body() updateUnitDTO: UpdateUnitDTO,
  ): Promise<ResponseUnitDTO> {
    const unit = await this.updateUnitUseCase.execute(id, updateUnitDTO);

    return plainToInstance(ResponseUnitDTO, unit, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUnitOperations.deleteUnit()
  async deleteUnit(@Param('id') id: string): Promise<void> {
    await this.deleteUnitUseCase.execute(id);
  }
}
