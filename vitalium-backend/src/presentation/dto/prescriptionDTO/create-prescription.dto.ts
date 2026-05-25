import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePrescriptionDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  unitId: string;

  @ApiProperty({ example: 'Amoxicilina' })
  @IsString()
  medication: string;

  @ApiProperty({ example: '500mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ example: 'A cada 8 horas' })
  @IsString()
  frequency: string;

  @ApiProperty({ example: '7 dias' })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ example: 'Tomar com água' })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({ example: '2026-05-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  prescribedAt?: string;
}
