import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import type { Admin } from '../../../infrastructure/database/models/admin.models';
import type { Caregiver } from '../../../infrastructure/database/models/caregiver.models';
import type { Doctor } from '../../../infrastructure/database/models/doctor.models';
import type { Nurse } from '../../../infrastructure/database/models/nurse.models';
import type { Patient } from '../../../infrastructure/database/models/patient.models';
import { Role } from '../../../shared/enums';

export class UpdateUserDTO {
  @ApiPropertyOptional({
    description: 'Email único do usuário',
    example: 'joao.silva@exemplo.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Primeiro nome do usuário',
    example: 'João',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Sobrenome do usuário',
    example: 'Silva Santos',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '11999999999',
  })
  @Matches(/^(\+55)?\d{11}$/, {
    message: 'Telefone deve conter 11 números (EX: 62999999999)',
  })
  @IsOptional()
  @IsString()
  phone?: string;
  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
    example: 'https://exemplo.com/novo-avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Status ativo/inativo do usuário',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Função do usuário no sistema',
    enum: Role,
    example: Role.DOCTOR,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    description: 'Data de criação (não recomendado alterar)',
    example: '2024-01-01T00:00:00.000Z',
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Data da última atualização (atualizada automaticamente)',
    example: '2024-01-15T10:30:00.000Z',
    readOnly: true,
  })
  @IsOptional()
  @IsString()
  updatedAt?: string;

  patient?: Patient;
  doctor?: Doctor;
  nurse?: Nurse;
  caregiver?: Caregiver;
  admin?: Admin;
}
