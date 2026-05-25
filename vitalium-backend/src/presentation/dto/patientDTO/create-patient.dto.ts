import { ApiProperty } from '@nestjs/swagger';
import { BloodType, Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreatePatientDTO {
  @ApiProperty({
    description: 'ID do usuário associado (role PATIENT)',
    example: 'clxyz123456789abcdef',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'CPF do paciente (apenas dígitos)',
    example: '12345678901',
  })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos' })
  cpf: string;

  @ApiProperty({
    description: 'RG do paciente',
    example: '1234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiProperty({
    description: 'Data de nascimento (ISO 8601)',
    example: '1990-05-15',
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    description: 'Gênero do paciente',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'Tipo sanguíneo',
    enum: BloodType,
    example: BloodType.O_POSITIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;

  @ApiProperty({
    description: 'Alergias conhecidas',
    example: 'Dipirona, Penicilina',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiProperty({
    description: 'Nome do contato de emergência',
    example: 'Maria Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone do contato de emergência',
    example: '+5511999999999',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Endereço residencial',
    example: 'Rua das Flores, 123',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Estado (UF)',
    example: 'SP',
    required: false,
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'CEP',
    example: '01310-100',
    required: false,
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({
    description: 'Número WhatsApp para comunicação',
    example: '+5511999999999',
    required: false,
  })
  @IsOptional()
  @IsString()
  whatsappPhone?: string;

  @ApiProperty({
    description:
      'ID da unidade para vincular o paciente na admissão (PatientUnit)',
    example: 'clabc987654321fedcba',
    required: false,
  })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiProperty({
    description: 'Unidade principal do paciente neste vínculo',
    example: true,
    required: false,
  })
  @IsOptional()
  isPrimary?: boolean;
}
