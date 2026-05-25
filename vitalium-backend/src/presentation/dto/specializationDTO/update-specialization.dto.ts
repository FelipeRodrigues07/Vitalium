<<<<<<< HEAD
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSpecializationDTO {
=======
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSpecializationDTO {
  @ApiProperty({
    description: 'Nome da especialização médica',
    example: 'Cardiologia',
    required: false,
  })
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  @IsOptional()
  @IsString()
  name?: string;

<<<<<<< HEAD
=======
  @ApiProperty({
    description: 'Descrição da especialização',
    example:
      'Especialidade médica que cuida do coração e do sistema cardiovascular',
    required: false,
  })
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  @IsOptional()
  @IsString()
  description?: string;

<<<<<<< HEAD
=======
  @ApiProperty({
    description: 'Status da especialização',
    example: true,
    required: false,
  })
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
