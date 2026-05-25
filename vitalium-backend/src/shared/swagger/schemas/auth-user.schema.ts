import { AdminRole } from '../../enums/admin-role.enum';

export const authUserResponseProperties = {
  id: { type: 'string', example: 'clxyz123456789abcdef' },
  email: { type: 'string', example: 'admin@vitalium.com' },
  firstName: { type: 'string', example: 'Admin' },
  lastName: { type: 'string', example: 'Sistema' },
  role: {
    type: 'string',
    enum: ['PATIENT', 'DOCTOR', 'NURSE', 'CAREGIVER', 'ADMIN'],
    example: 'ADMIN',
  },
  adminId: {
    type: 'string',
    description: 'ID do perfil admin (apenas quando role é ADMIN)',
    example: 'clxyz123456789abcdef',
  },
  adminRole: {
    type: 'string',
    enum: Object.values(AdminRole),
    description:
      'Subtipo do admin: SUPER_ADMIN (plataforma), HOSPITAL_ADMIN ou CLINIC_ADMIN',
    example: AdminRole.SUPER_ADMIN,
  },
  unitIds: {
    type: 'array',
    items: { type: 'string' },
    description:
      'Unidades do admin. Vazio para SUPER_ADMIN. Preenchido para admin de hospital/clínica.',
    example: [],
  },
};

export const authJwtProfileProperties = {
  sub: { type: 'string', example: 'clxyz123456789abcdef' },
  email: { type: 'string', example: 'admin@vitalium.com' },
  firstName: { type: 'string', example: 'Admin' },
  lastName: { type: 'string', example: 'Sistema' },
  role: {
    type: 'string',
    enum: ['PATIENT', 'DOCTOR', 'NURSE', 'CAREGIVER', 'ADMIN'],
    example: 'ADMIN',
  },
  adminId: authUserResponseProperties.adminId,
  adminRole: authUserResponseProperties.adminRole,
  unitIds: authUserResponseProperties.unitIds,
};

export const SUPER_ADMIN_FORBIDDEN_DESCRIPTION =
  'Acesso negado — requer SUPER_ADMIN (gestão global via Swagger)';
