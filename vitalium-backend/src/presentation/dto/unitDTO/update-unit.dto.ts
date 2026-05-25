import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateUnitDTO {
  @ApiProperty({ example: 'Hospital São Paulo', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Rua das Flores, 123', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    example: '01234567',
    required: false,
    description: 'CEP da unidade (apenas números, 8 dígitos)',
  })
  @IsOptional()
  @Matches(/^\d{8}$/, {
    message: 'CEP deve conter exatamente 8 números',
  })
  zipCode?: string;

  @IsOptional()
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  @Matches(/^\d{10,11}$/, {
    message:
      'Telefone deve conter apenas números e ter 10 (fixo) ou 11 (celular) dígitos',
  })
  phone?: string;

  @ApiProperty({ example: 'contato@hospital.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '12345678000190',
    required: false,
    description: 'CNPJ da unidade (apenas números, 14 dígitos)',
  })
  @IsOptional()
  @Matches(/^\d{14}$/, {
    message: 'CNPJ deve conter exatamente 14 números',
  })
  cnpj?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
