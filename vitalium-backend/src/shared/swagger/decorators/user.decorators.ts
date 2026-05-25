import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiUserOperations = {
  createUser: () =>
    applyDecorators(
      ApiTags('users'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar novo usuário',
        description:
          'Cria um novo usuário no sistema com as informações fornecidas. Requer autenticação.',
      }),
      ApiBody({
        description: 'Dados para criação do usuário',
        schema: {
          type: 'object',
          required: ['email', 'firstName', 'lastName', 'role', 'isActive'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@exemplo.com',
              description: 'Email único do usuário',
            },
            firstName: {
              type: 'string',
              example: 'João',
              description: 'Primeiro nome do usuário',
            },
            lastName: {
              type: 'string',
              example: 'Silva',
              description: 'Sobrenome do usuário',
            },
            phone: {
              type: 'string',
              example: '11999999999',
              description: 'Telefone do usuário (opcional)',
            },
            avatar: {
              type: 'string',
              example: 'https://exemplo.com/avatar.jpg',
              description: 'URL do avatar do usuário (opcional)',
            },
            role: {
              type: 'string',
              enum: ['PATIENT', 'DOCTOR', 'NURSE', 'ADMIN', 'CAREGIVER'],
              example: 'PATIENT',
              description: 'Função do usuário no sistema',
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Status ativo/inativo do usuário',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'joao@exemplo.com' },
            firstName: { type: 'string', example: 'João' },
            lastName: { type: 'string', example: 'Silva' },
            phone: { type: 'string', example: '+55 11 99999-9999' },
            avatar: {
              type: 'string',
              example: 'https://exemplo.com/avatar.jpg',
            },
            role: { type: 'string', example: 'PATIENT' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Dados de entrada inválidos',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: { type: 'array', items: { type: 'string' } },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      }),
      ApiResponse({
        status: 409,
        description: 'Email já existe no sistema',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 409 },
            message: { type: 'string', example: 'Email já está em uso' },
            error: { type: 'string', example: 'Conflict' },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
    ),

  findAllUsers: () =>
    applyDecorators(
      ApiTags('users'),
      ApiOperation({
        summary: 'Listar usuários',
        description:
          'SUPER_ADMIN: todos os usuários. HOSPITAL_ADMIN/CLINIC_ADMIN: apenas usuários vinculados às unidades do admin (médicos, pacientes, enfermeiras etc.).',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiResponse({
        status: 200,
        description: 'Lista de usuários retornada com sucesso',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              avatar: { type: 'string' },
              role: { type: 'string' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autorizado - Token JWT inválido ou ausente',
      }),
    ),

  findUserById: () =>
    applyDecorators(
      ApiTags('users'),
      ApiOperation({
        summary: 'Buscar usuário por ID',
        description: 'Retorna os dados de um usuário específico pelo seu ID',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiParam({
        name: 'id',
        description: 'ID único do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
      ApiResponse({
        status: 200,
        description: 'Usuário encontrado com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autorizado',
      }),
    ),

  updateUser: () =>
    applyDecorators(
      ApiTags('users'),
      ApiOperation({
        summary: 'Atualizar usuário',
        description:
          'Atualiza os dados de um usuário existente. Todos os campos são opcionais.',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiParam({
        name: 'id',
        description: 'ID único do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
      ApiBody({
        description:
          'Dados para atualização do usuário (todos campos opcionais)',
        schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'joao.silva@exemplo.com',
              description: 'Novo email do usuário',
            },
            firstName: {
              type: 'string',
              example: 'João',
              description: 'Novo primeiro nome',
            },
            lastName: {
              type: 'string',
              example: 'Silva Santos',
              description: 'Novo sobrenome',
            },
            phone: {
              type: 'string',
              example: '+55 11 98765-4321',
              description: 'Novo telefone',
            },
            avatar: {
              type: 'string',
              example: 'https://exemplo.com/novo-avatar.jpg',
              description: 'Nova URL do avatar',
            },
            role: {
              type: 'string',
              enum: ['PATIENT', 'DOCTOR', 'NURSE', 'ADMIN', 'CAREGIVER'],
              example: 'DOCTOR',
              description: 'Nova função do usuário',
            },
            isActive: {
              type: 'boolean',
              example: false,
              description: 'Novo status ativo/inativo',
            },
          },
        },
        examples: {
          'Atualizar Nome': {
            summary: 'Atualizar apenas nome',
            value: {
              firstName: 'João Carlos',
              lastName: 'Silva Santos',
            },
          },
          'Atualizar Email e Telefone': {
            summary: 'Atualizar email e telefone',
            value: {
              email: 'joao.carlos@novodominio.com',
              phone: '+55 11 91234-5678',
            },
          },
          'Alterar Função': {
            summary: 'Alterar função do usuário',
            value: {
              role: 'DOCTOR',
            },
          },
          'Desativar Usuário': {
            summary: 'Desativar usuário',
            value: {
              isActive: false,
            },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Usuário atualizado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'joao.silva@exemplo.com' },
            firstName: { type: 'string', example: 'João' },
            lastName: { type: 'string', example: 'Silva Santos' },
            phone: { type: 'string', example: '+55 11 98765-4321' },
            avatar: {
              type: 'string',
              example: 'https://exemplo.com/novo-avatar.jpg',
            },
            role: { type: 'string', example: 'DOCTOR' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            updatedAt: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: { type: 'string', example: 'Usuário não encontrado' },
            error: { type: 'string', example: 'Not Found' },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Dados de entrada inválidos',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: { type: 'array', items: { type: 'string' } },
            error: { type: 'string', example: 'Bad Request' },
          },
        },
      }),
      ApiResponse({
        status: 409,
        description: 'Conflito - Email já existe',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 409 },
            message: {
              type: 'string',
              example: 'Email já está em uso por outro usuário',
            },
            error: { type: 'string', example: 'Conflict' },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autorizado',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 401 },
            message: {
              type: 'string',
              example: 'Token JWT inválido ou ausente',
            },
            error: { type: 'string', example: 'Unauthorized' },
          },
        },
      }),
    ),

  deleteUser: () =>
    applyDecorators(
      ApiTags('users'),
      ApiOperation({
        summary: 'Deletar usuário',
        description: 'Remove permanentemente um usuário do sistema',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiParam({
        name: 'id',
        description: 'ID único do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
      }),
      ApiResponse({
        status: 200,
        description: 'Usuário deletado com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autorizado',
      }),
    ),

  findUserByEmail: () =>
    applyDecorators(
      ApiTags('users'),
      ApiOperation({
        summary: 'Buscar usuário por email',
        description: 'Retorna os dados de um usuário específico pelo seu email',
      }),
      ApiBearerAuth('JWT-auth'),
      ApiParam({
        name: 'email',
        description: 'Email do usuário',
        example: 'joao@exemplo.com',
      }),
      ApiResponse({
        status: 200,
        description: 'Usuário encontrado com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autorizado',
      }),
    ),
};
