import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseUnitDTO } from '../../unitDTO/response/unit-response.dto';
import { UserResponseDTO } from '../../userDTO/response/user-response.dto';

export class DoctorResponseDTO {
  @ApiProperty({
    description: 'ID único do médico',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID do usuário associado ao médico',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Número do CRM do médico (único no sistema)',
    example: '123456-SP',
  })
  @Expose()
  crm: string;

  @ApiProperty({
    description: 'Indica se o CRM do médico está ativo',
    example: true,
    default: true,
  })
  @Expose()
  crmState: boolean;

  @ApiProperty({
    description: 'Status do perfil do médico (ativo/inativo)',
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

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: string;

  // Relacionamentos
  @ApiProperty({
    description: 'Usuário associado ao médico',
    type: () => UserResponseDTO,
  })
  @Expose()
  @Type(() => UserResponseDTO)
  user?: UserResponseDTO;

  @ApiProperty({
    description: 'Unidades associadas ao médico',
    type: () => [ResponseUnitDTO],
    isArray: true,
  })
  @Expose()
  @Type(() => ResponseUnitDTO)
  units?: ResponseUnitDTO[];
}
