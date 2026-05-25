import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdmissionStatus } from '../../../shared/enums/admission-status.enum';

export class CreateWardAdmissionDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  wardId: string;

  @ApiProperty({ example: 'Pneumonia grave' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: '2026-05-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional({
    enum: AdmissionStatus,
    example: AdmissionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AdmissionStatus)
  status?: AdmissionStatus;

  @ApiPropertyOptional({ example: 'Paciente em estado grave' })
  @IsOptional()
  @IsString()
  notes?: string;
}
