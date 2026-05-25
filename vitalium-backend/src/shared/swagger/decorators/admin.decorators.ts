import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminRole } from '../../enums/admin-role.enum';
import { SUPER_ADMIN_FORBIDDEN_DESCRIPTION } from '../schemas/auth-user.schema';

export const ApiAdminOperations = {
  createAdmin: () =>
    applyDecorators(
      ApiTags('admins'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar admin',
        description:
          'Cria o perfil de admin para um usuário com role ADMIN. **Apenas SUPER_ADMIN**. HOSPITAL_ADMIN/CLINIC_ADMIN exigem unitIds; SUPER_ADMIN não deve ter unidades.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['userId', 'role'],
          properties: {
            userId: {
              type: 'string',
              example: 'clxyz123456789abcdef',
              description: 'ID do usuário com role ADMIN',
            },
            role: {
              type: 'string',
              enum: Object.values(AdminRole),
              example: AdminRole.HOSPITAL_ADMIN,
            },
            isActive: { type: 'boolean', example: true },
            unitIds: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Obrigatório para HOSPITAL_ADMIN e CLINIC_ADMIN. Omitir ou [] para SUPER_ADMIN.',
              example: ['clxyz-unit-hospital-1'],
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Admin criado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxyz123456789abcdef' },
            userId: { type: 'string', example: 'clxyz123456789abcdef' },
            role: {
              type: 'string',
              enum: Object.values(AdminRole),
              example: AdminRole.HOSPITAL_ADMIN,
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string', example: 'João' },
                lastName: { type: 'string', example: 'Silva' },
                email: { type: 'string', example: 'joao@exemplo.com' },
                role: { type: 'string', example: 'ADMIN' },
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Dados inválidos ou usuário não tem role ADMIN',
      }),
      ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
      ApiResponse({
        status: 409,
        description: 'Admin já cadastrado para esse usuário',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: SUPER_ADMIN_FORBIDDEN_DESCRIPTION,
      }),
    ),

  findAdminById: () =>
    applyDecorators(
      ApiTags('admins'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Buscar admin por ID',
        description:
          'Retorna os dados de um admin pelo ID. **Apenas SUPER_ADMIN**.',
      }),
      ApiParam({ name: 'id', type: 'string', example: 'clxyz123456789abcdef' }),
      ApiResponse({
        status: 200,
        description: 'Admin encontrado',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxyz123456789abcdef' },
            userId: { type: 'string', example: 'clxyz123456789abcdef' },
            role: {
              type: 'string',
              enum: Object.values(AdminRole),
              example: AdminRole.HOSPITAL_ADMIN,
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string', example: 'João' },
                lastName: { type: 'string', example: 'Silva' },
                email: { type: 'string', example: 'joao@exemplo.com' },
                role: { type: 'string', example: 'ADMIN' },
                isActive: { type: 'boolean', example: true },
              },
            },
          },
        },
      }),
      ApiResponse({ status: 404, description: 'Admin não encontrado' }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: SUPER_ADMIN_FORBIDDEN_DESCRIPTION,
      }),
    ),

  updateAdmin: () =>
    applyDecorators(
      ApiTags('admins'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Atualizar admin',
        description:
          'Atualiza role ou status de um admin. **Apenas SUPER_ADMIN**.',
      }),
      ApiParam({ name: 'id', type: 'string', example: 'clxyz123456789abcdef' }),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: Object.values(AdminRole),
              example: AdminRole.CLINIC_ADMIN,
            },
            isActive: { type: 'boolean', example: true },
          },
        },
      }),
      ApiResponse({ status: 200, description: 'Admin atualizado com sucesso' }),
      ApiResponse({ status: 404, description: 'Admin não encontrado' }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: SUPER_ADMIN_FORBIDDEN_DESCRIPTION,
      }),
    ),

  deleteAdmin: () =>
    applyDecorators(
      ApiTags('admins'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Desativar admin',
        description:
          'Realiza soft delete do perfil de admin. **Apenas SUPER_ADMIN**.',
      }),
      ApiParam({ name: 'id', type: 'string', example: 'clxyz123456789abcdef' }),
      ApiResponse({ status: 204, description: 'Admin desativado com sucesso' }),
      ApiResponse({ status: 404, description: 'Admin não encontrado' }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: SUPER_ADMIN_FORBIDDEN_DESCRIPTION,
      }),
    ),
};
