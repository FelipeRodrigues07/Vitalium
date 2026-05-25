import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSpecializationDTO {
  @ApiProperty({ example: 'Cardiologia' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Especialidade focada em doenças do coração',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
