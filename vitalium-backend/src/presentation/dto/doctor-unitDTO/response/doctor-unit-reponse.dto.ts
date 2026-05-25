import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { Doctor } from '../../../../infrastructure/database/models/doctor.models';
import type { Unit } from '../../../../infrastructure/database/models/unit.models';

export class DoctorUnitResponseDTO {
  @ApiProperty({
    description: 'ID único da associação Médico com Unidade',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID do médico',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  doctorId: string;

  @ApiProperty({
    description: 'ID da unidade',
    example: true,
    default: true,
  })
  @Expose()
  unitId: boolean;

  @ApiProperty({
    description: 'Preço da consulta médica em reais',
    example: 150.0,
    type: Number,
  })
  @Expose()
  consultationPrice?: number;

  @ApiProperty({
    description: 'Status do perfil do médico (ativo/inativo)',
    example: true,
    default: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Esta é a unidade principal do médico?',
    example: true,
    default: false,
    required: false,
  })
  @Expose()
  isPrimary?: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: string;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: string;

  // Relacionamentos

  @ApiProperty({
    description: 'Médico associado',
  })
  @Expose()
  doctor?: Doctor;

  @ApiProperty({
    description: 'Unidade associada',
  })
  @Expose()
  unit?: Unit;
}
