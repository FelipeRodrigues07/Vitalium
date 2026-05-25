import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AdminRole } from '../../../../shared/enums/admin-role.enum';
import { UserResponseDTO } from '../../userDTO/response/user-response.dto';

export class AdminResponseDTO {
  @ApiProperty({
    description: 'ID único do admin',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'ID do usuário associado',
    example: 'clxyz123456789abcdef',
  })
  @Expose()
  userId: string;

  @ApiProperty({
    description: 'Tipo de admin',
    enum: AdminRole,
    example: AdminRole.HOSPITAL_ADMIN,
  })
  @Expose()
  role: AdminRole;

  @ApiProperty({
    description: 'Permissões customizadas',
    example: { canManageUsers: true },
    nullable: true,
  })
  @Expose()
  permissions?: Record<string, unknown>;

  @ApiProperty({
    description: 'Status do admin',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: string;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: string;

  @ApiProperty({
    description: 'Usuário associado ao admin',
    type: () => UserResponseDTO,
  })
  @Expose()
  @Type(() => UserResponseDTO)
  user?: UserResponseDTO;
}
