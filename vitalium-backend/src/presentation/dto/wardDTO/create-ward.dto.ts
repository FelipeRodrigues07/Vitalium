import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { WardType } from '../../../shared/enums/ward-type.enum';

export class CreateWardDTO {
  @ApiProperty({ example: 'clxyz123456789' })
  @IsString()
  unitId: string;

  @ApiProperty({ example: 'Ala Norte' })
  @IsString()
  name: string;

  @ApiProperty({ enum: WardType, example: WardType.GENERAL })
  @IsEnum(WardType)
  type: WardType;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ example: '2' })
  @IsOptional()
  @IsString()
  floor?: string;
}
