import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePatientUnitDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  patientId: string;

  @ApiProperty({ example: 'clxyz987654321' })
  @IsString()
  unitId: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
