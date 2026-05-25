import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePatientDoctorDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'clxyz987654321' })
  @IsString()
  doctorId: string;

  @ApiPropertyOptional({ example: '2025-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;
}
