import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiSecretaryOperations = {
  create: () =>
    applyDecorators(
      ApiTags('secretaries'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Cadastrar secretária(o)' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
            isActive: { type: 'boolean', example: true },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Secretária(o) cadastrada(o)' }),
      ApiResponse({ status: 409, description: 'Já cadastrada(o)' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiTags('secretaries'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar secretárias(os)' }),
      ApiQuery({ name: 'isActive', required: false, type: 'boolean' }),
      ApiResponse({ status: 200, description: 'Lista de secretárias(os)' }),
    ),

  findMe: () =>
    applyDecorators(
      ApiTags('secretaries'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Perfil da secretária(o) autenticada(o)' }),
      ApiResponse({ status: 200, description: 'Perfil encontrado' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('secretaries'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar secretária(o) por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Secretária(o) encontrada(o)' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('secretaries'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar secretária(o)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Atualizado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('secretaries'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Excluir secretária(o)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Excluído' }),
    ),
};

export const ApiSecretaryUnitOperations = {
  create: () =>
    applyDecorators(
      ApiTags('secretary-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular secretária(o) a unidade' }),
      ApiResponse({ status: 201, description: 'Vínculo criado' }),
    ),

  findBySecretary: () =>
    applyDecorators(
      ApiTags('secretary-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar unidades da secretária(o)' }),
    ),

  findByUnit: () =>
    applyDecorators(
      ApiTags('secretary-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar secretárias(os) da unidade' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('secretary-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar vínculo por ID' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('secretary-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar vínculo' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('secretary-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Excluir vínculo' }),
    ),
};
