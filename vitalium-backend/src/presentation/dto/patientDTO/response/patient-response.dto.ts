import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { ResponseUnitDTO } from '../../unitDTO/response/unit-response.dto';
import { UserResponseDTO } from '../../userDTO/response/user-response.dto';
import { PatientDoctorResponseDTO } from './patient-doctor-response.dto';

export class PatientResponseDTO {
  @ApiProperty({
    description: 'ID único do paciente',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID do usuário associado ao paciente',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'CPF do paciente',
    example: '12345678901',
  })
  @Expose()
  cpf: string;

  @ApiPropertyOptional({
    description: 'RG do paciente',
    example: '1234567',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  rg?: string;

  @ApiProperty({
    description: 'Data de nascimento',
    example: '1990-05-15T00:00:00.000Z',
  })
  @Expose()
  birthDate: Date;

  @ApiProperty({
    description: 'Gênero do paciente',
    example: 'MALE',
  })
  @Expose()
  gender: string;

  @ApiPropertyOptional({
    description: 'Tipo sanguíneo',
    example: 'O_POSITIVE',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  bloodType?: string;

  @ApiPropertyOptional({
    description: 'Alergias conhecidas',
    example: 'Dipirona, Penicilina',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  allergies?: string;

  @ApiPropertyOptional({
    description: 'Nome do contato de emergência',
    example: 'Maria Silva',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  emergencyContact?: string;

  @ApiPropertyOptional({
    description: 'Telefone do contato de emergência',
    example: '+5511999999999',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  emergencyPhone?: string;

  @ApiPropertyOptional({
    description: 'Endereço residencial',
    example: 'Rua das Flores, 123',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  address?: string;

  @ApiPropertyOptional({
    description: 'Cidade',
    example: 'São Paulo',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  city?: string;

  @ApiPropertyOptional({
    description: 'Estado (UF)',
    example: 'SP',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  state?: string;

  @ApiPropertyOptional({
    description: 'CEP',
    example: '01310-100',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'Número WhatsApp para comunicação',
    example: '+5511999999999',
  })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  whatsappPhone?: string;

  @ApiProperty({
    description: 'Status ativo/inativo do paciente',
    example: true,
  })
  @Expose()
  isActive: boolean;

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

  @ApiProperty({
    description: 'Usuário associado ao paciente',
    type: () => UserResponseDTO,
  })
  @Expose()
  @Type(() => UserResponseDTO)
  user?: UserResponseDTO;

  @ApiPropertyOptional({
    description: 'Unidades de saúde vinculadas ao paciente',
    type: () => [ResponseUnitDTO],
    isArray: true,
  })
  @Expose()
  @Type(() => ResponseUnitDTO)
  units?: ResponseUnitDTO[];

  @ApiPropertyOptional({
    description: 'Vínculos com médicos responsáveis',
    type: () => [PatientDoctorResponseDTO],
    isArray: true,
  })
  @Expose()
  @Type(() => PatientDoctorResponseDTO)
  patientDoctors?: PatientDoctorResponseDTO[];
}
