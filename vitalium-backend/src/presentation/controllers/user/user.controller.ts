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
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { plainToInstance } from 'class-transformer';
import { CreateUserDTO } from '../../dto/userDTO/create-user.dto';
import { UserResponseDTO } from '../../dto/userDTO/response/user-response.dto';
import { ApiUserOperations } from '../../../shared/swagger/decorators';
import { CreateUserUseCase } from '../../../application/use-cases/user/create-user.use-case';
import { UpdateUserDTO } from '../../dto/userDTO/update-user.dtp';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { SearchUserUseCase } from '../../../application/use-cases/user/search-user.use-case';
import { UpdateUserUseCase } from '../../../application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../../application/use-cases/user/delete-user.use-case';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Role } from '../../../shared/enums';
import { ApiTags } from '@nestjs/swagger';
import type { AuthJwtPayload } from '../../../shared/types/auth-jwt-payload.interface';

interface RequestWithUser extends ExpressRequest {
  user: AuthJwtPayload;
}

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly searchUserUseCase: SearchUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiUserOperations.createUser()
  async create(@Body() createUserDTO: CreateUserDTO): Promise<UserResponseDTO> {
    const user = await this.createUserUseCase.execute(createUserDTO);

    return plainToInstance(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiUserOperations.findAllUsers()
  async findAll(
    @Request() req: RequestWithUser,
    @Query('unitId') unitId?: string,
  ): Promise<UserResponseDTO[]> {
    const users = await this.searchUserUseCase.findAll(req.user, unitId);

    return plainToInstance(UserResponseDTO, users, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiUserOperations.findUserById()
  async findOne(@Param('id') id: string): Promise<UserResponseDTO> {
    const user = await this.searchUserUseCase.findById(id);

    return plainToInstance(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiUserOperations.findUserByEmail()
  async findByEmail(@Param('email') email: string): Promise<UserResponseDTO> {
    const user = await this.searchUserUseCase.findByEmail(email);

    return plainToInstance(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiUserOperations.updateUser()
  async update(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<UserResponseDTO> {
    const user = await this.updateUserUseCase.execute(id, updateUserDTO);

    return plainToInstance(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUserOperations.deleteUser()
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUserUseCase.execute(id);
  }
}
