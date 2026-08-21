import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSecretaryUnitDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  secretaryId: string;

  @ApiProperty({ example: 'clxyz987654321' })
  @IsString()
  unitId: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
