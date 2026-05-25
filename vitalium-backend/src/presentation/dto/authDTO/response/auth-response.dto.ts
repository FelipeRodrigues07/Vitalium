import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import type { Role } from '../../../../shared/enums';
import { AdminRole } from '../../../../shared/enums/admin-role.enum';

export class AuthUserDTO {
  @ApiProperty({ example: 'cld1234abc' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'joao@exemplo.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'João' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Silva' })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: 'PATIENT',
    enum: ['PATIENT', 'DOCTOR', 'NURSE', 'CAREGIVER', 'ADMIN'],
  })
  @Expose()
  role: Role;

  @ApiProperty({
    required: false,
    description: 'ID do perfil admin (quando role é ADMIN)',
  })
  @Expose()
  adminId?: string;

  @ApiProperty({
    required: false,
    enum: AdminRole,
    description:
      'Subtipo do admin: SUPER_ADMIN, HOSPITAL_ADMIN ou CLINIC_ADMIN',
  })
  @Expose()
  adminRole?: AdminRole;

  @ApiProperty({
    required: false,
    type: [String],
    description:
      'Unidades do admin. Vazio para SUPER_ADMIN (acesso global). Preenchido para admin de hospital/clínica.',
  })
  @Expose()
  unitIds?: string[];
}

export class AuthResponseDTO {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ type: AuthUserDTO })
  @Type(() => AuthUserDTO)
  user: AuthUserDTO;
}
