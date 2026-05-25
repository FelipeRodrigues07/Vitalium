import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import type { Admin } from '../../../../infrastructure/database/models/admin.models';
import type { Caregiver } from '../../../../infrastructure/database/models/caregiver.models';
import type { Doctor } from '../../../../infrastructure/database/models/doctor.models';
import type { Nurse } from '../../../../infrastructure/database/models/nurse.models';
import type { Patient } from '../../../../infrastructure/database/models/patient.models';
import { Role } from '../../../../shared/enums';

export class UserResponseDTO {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@exemplo.com',
  })
  @Expose()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    description: 'Primeiro nome do usuário',
    example: 'João',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Silva',
  })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '+55 11 99999-9999',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  phone?: string;

  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
    example: 'https://exemplo.com/avatar.jpg',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  avatar?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do usuário',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Função do usuário no sistema',
    enum: Role,
    example: Role.PATIENT,
  })
  @Expose()
  role: Role;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: string;

  @ApiProperty({
    description: 'Data da última atualização do usuário',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Nome do médico responsável ativo (role PATIENT)',
    example: 'Dr. João Silva',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  responsibleDoctorName?: string;

  @ApiPropertyOptional({
    description: 'CRM do médico responsável ativo (role PATIENT)',
    example: '123456',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  responsibleDoctorCrm?: string;

  patient?: Patient;
  doctor?: Doctor;
  nurse?: Nurse;
  caregiver?: Caregiver;
  admin?: Admin;
}
