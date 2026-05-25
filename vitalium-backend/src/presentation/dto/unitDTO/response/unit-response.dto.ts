import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { UnitType } from '../../../../shared/enums/unit.enum';

export class ResponseUnitDTO {
  @ApiProperty({
    description: 'ID único da unidade',
    example: 'cm2def456ghi789abc123',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Hospital Central',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Tipo da unidade',
    enum: UnitType,
    example: UnitType.HOSPITAL,
  })
  @Expose()
  type: UnitType;

  @ApiPropertyOptional({
    description: 'CNPJ da unidade',
    example: '98.765.432/0001-10',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  cnpj?: string;

  @ApiPropertyOptional({
    description: 'Telefone da unidade',
    example: '+55 11 2151-1234',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Email da unidade',
    example: 'contato@hospital.com.br',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  email?: string;

  @ApiPropertyOptional({
    description: 'Endereço da unidade',
    example: 'Av. Paulista, 1000',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  address?: string;

  @ApiPropertyOptional({
    description: 'Cidade da unidade',
    example: 'São Paulo',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado da unidade',
    example: 'SP',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  state?: string;

  @ApiPropertyOptional({
    description: 'CEP da unidade',
    example: '01310-100',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  zipCode?: string;

  @ApiProperty({
    description: 'Status ativo da unidade',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação da unidade',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização da unidade',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
