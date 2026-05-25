import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UnitType } from '../../../shared/enums/unit.enum';

export class CreateUnitDTO {
  @ApiProperty({ example: 'Hospital São Paulo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'HOSPITAL' })
  @IsEnum(UnitType)
  type: UnitType;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  state: string;

  @ApiProperty({
    example: '01234567',
    description: 'CEP da unidade (apenas números, 8 dígitos)',
  })
  @Matches(/^\d{8}$/, {
    message: 'CEP deve conter exatamente 8 números',
  })
  zipCode: string;

  @IsOptional()
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @Matches(/^\d{10,11}$/, {
    message:
      'Telefone deve conter apenas números e ter 10 (fixo) ou 11 (celular) dígitos',
  })
  phone?: string;

  @ApiProperty({ example: 'contato@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678000190',
    description: 'CNPJ da unidade (apenas números, 14 dígitos)',
  })
  @Matches(/^\d{14}$/, {
    message: 'CNPJ deve conter exatamente 14 números',
  })
  cnpj: string;
}
