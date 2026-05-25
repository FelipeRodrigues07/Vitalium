import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminRole } from '../../../shared/enums/admin-role.enum';

export class CreateAdminDTO {
  @ApiProperty({
    description: 'ID do usuário com role ADMIN a ser associado',
    example: 'clxyz123456789abcdef',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Tipo de admin',
    enum: AdminRole,
    example: AdminRole.HOSPITAL_ADMIN,
  })
  @IsEnum(AdminRole)
  role: AdminRole;

  @ApiProperty({
    description: 'Permissões customizadas (JSON livre)',
    example: { canManageUsers: true },
    required: false,
  })
  @IsOptional()
  permissions?: Record<string, unknown>;

  @ApiProperty({
    description: 'Status do admin',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description:
      'Unidades vinculadas (obrigatório para HOSPITAL_ADMIN e CLINIC_ADMIN)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  unitIds?: string[];
}
