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

export const ApiNurseOperations = {
  create: () =>
    applyDecorators(
      ApiTags('nurses'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Cadastrar enfermeiro(a)' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['userId', 'coren', 'corenState'],
          properties: {
            userId: { type: 'string' },
            coren: { type: 'string', example: 'SP-123456' },
            corenState: { type: 'boolean', example: true },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Enfermeiro(a) cadastrado(a)' }),
      ApiResponse({ status: 409, description: 'COREN já cadastrado' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiTags('nurses'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar enfermeiros(as)' }),
      ApiQuery({ name: 'isActive', required: false, type: 'boolean' }),
      ApiResponse({ status: 200, description: 'Lista de enfermeiros(as)' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('nurses'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar enfermeiro(a) por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Enfermeiro(a) encontrado(a)' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('nurses'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar dados do enfermeiro(a)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Enfermeiro(a) atualizado(a)' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('nurses'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Excluir enfermeiro(a)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Excluído com sucesso' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),
};

export const ApiNurseUnitOperations = {
  create: () =>
    applyDecorators(
      ApiTags('nurse-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular enfermeiro(a) a unidade' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['nurseId', 'unitId'],
          properties: {
            nurseId: { type: 'string' },
            unitId: { type: 'string' },
            wardId: { type: 'string' },
            isPrimary: { type: 'boolean', default: false },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Vínculo criado' }),
    ),

  findByNurse: () =>
    applyDecorators(
      ApiTags('nurse-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar unidades de um(a) enfermeiro(a)' }),
      ApiParam({ name: 'nurseId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findByUnit: () =>
    applyDecorators(
      ApiTags('nurse-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar enfermeiros(as) de uma unidade' }),
      ApiParam({ name: 'unitId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('nurse-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar vínculo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo encontrado' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('nurse-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar vínculo enfermeiro(a)-unidade' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo atualizado' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('nurse-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover vínculo enfermeiro(a)-unidade' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Removido com sucesso' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),
};
