<<<<<<< HEAD
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSpecializationDTO {
  @ApiProperty({ example: 'Cardiologia' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Especialidade focada em doenças do coração',
=======
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSpecializationDTO {
  @ApiProperty({
    description: 'Nome da especialização médica',
    example: 'Cardiologia',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Descrição da especialização',
    example:
      'Especialidade médica que cuida do coração e do sistema cardiovascular',
    required: false,
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  })
  @IsOptional()
  @IsString()
  description?: string;
<<<<<<< HEAD
=======

  @ApiProperty({
    description: 'Status da especialização',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive: boolean;
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
}
