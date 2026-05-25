import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateUserDTO {
  @ApiProperty({
    description: 'Email único do usuário',
    example: 'joao@exemplo.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'MinhaSenh@123',
    minLength: 8,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'João',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Silva',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  lastName: string;

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
    example: 'https://exemplo.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do usuário',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Função do usuário no sistema',
    enum: Role,
    example: Role.PATIENT,
  })
  @IsEnum(Role)
  role: Role;

  patient?: Patient;
  doctor?: Doctor;
  nurse?: Nurse;
  caregiver?: Caregiver;
  admin?: Admin;
}
