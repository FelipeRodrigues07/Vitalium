import { Expose } from 'class-transformer';
<<<<<<< HEAD
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpecializationResponseDTO {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiPropertyOptional() @Expose() description?: string;
  @ApiProperty() @Expose() isActive: boolean;
  @ApiProperty() @Expose() createdAt: string;
=======
import { ApiProperty } from '@nestjs/swagger';

export class SpecializationResponseDTO {
  @ApiProperty({
    description: 'ID único da especialização',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Nome da especialização médica',
    example: 'Cardiologia',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Descrição da especialização',
    example:
      'Especialidade médica que cuida do coração e do sistema cardiovascular',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Status da especialização (ativo/inativo)',
    example: true,
    default: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: string;
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
}
