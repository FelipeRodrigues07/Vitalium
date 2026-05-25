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
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiAdminOperations } from '../../../shared/swagger/decorators/admin.decorators';
import { CreateAdminUseCase } from '../../../application/use-cases/admin/create-admin.use-case';
import { SearchAdminUseCase } from '../../../application/use-cases/admin/search-admin.use-case';
import { UpdateAdminUseCase } from '../../../application/use-cases/admin/update-admin.use-case';
import { DeleteAdminUseCase } from '../../../application/use-cases/admin/delete-admin.use-case';
import { CreateAdminDTO } from '../../dto/adminDTO/create-admin.dto';
import { UpdateAdminDTO } from '../../dto/adminDTO/update-admin.dto';
import { AdminResponseDTO } from '../../dto/adminDTO/response/admin-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../../shared/guards/super-admin.guard';
import { SuperAdminOnly } from '../../../shared/decorators/super-admin.decorator';

@ApiTags('admins')
@Controller('admins')
@UseGuards(AuthGuard, RolesGuard, SuperAdminGuard)
@Roles(Role.ADMIN)
@SuperAdminOnly()
export class AdminController {
  constructor(
    private readonly createAdminUseCase: CreateAdminUseCase,
    private readonly searchAdminUseCase: SearchAdminUseCase,
    private readonly updateAdminUseCase: UpdateAdminUseCase,
    private readonly deleteAdminUseCase: DeleteAdminUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiAdminOperations.createAdmin()
  async create(@Body() dto: CreateAdminDTO): Promise<AdminResponseDTO> {
    const admin = await this.createAdminUseCase.execute(dto);
    return plainToInstance(AdminResponseDTO, admin, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiAdminOperations.findAdminById()
  async findById(@Param('id') id: string): Promise<AdminResponseDTO> {
    const admin = await this.searchAdminUseCase.execute(id);
    return plainToInstance(AdminResponseDTO, admin, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiAdminOperations.updateAdmin()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDTO,
  ): Promise<AdminResponseDTO> {
    const admin = await this.updateAdminUseCase.execute(id, dto);
    return plainToInstance(AdminResponseDTO, admin, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiAdminOperations.deleteAdmin()
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteAdminUseCase.execute(id);
  }
}
