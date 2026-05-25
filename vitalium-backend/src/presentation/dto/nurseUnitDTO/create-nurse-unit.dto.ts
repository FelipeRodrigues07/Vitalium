import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateNurseUnitDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  nurseId: string;

  @ApiProperty({ example: 'clxyz987654321' })
  @IsString()
  unitId: string;

  @ApiPropertyOptional({ example: 'clxyz000000001' })
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
