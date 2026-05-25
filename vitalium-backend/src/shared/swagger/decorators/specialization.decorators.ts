import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
<<<<<<< HEAD
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

export const ApiSpecializationOperations = {
  create: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Criar especialização médica' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Cardiologia' },
            description: {
              type: 'string',
              example: 'Doenças cardiovasculares',
=======
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export const ApiSpecializationOperations = {
  createSpecialization: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar nova especialização',
        description:
          'Cria uma nova especialização médica no sistema. Requer role **ADMIN**.',
      }),
      ApiBody({
        description: 'Dados para criação da especialização',
        schema: {
          type: 'object',
          required: ['name', 'isActive'],
          properties: {
            name: {
              type: 'string',
              example: 'Cardiologia',
              description: 'Nome da especialização (único no sistema)',
            },
            description: {
              type: 'string',
              example:
                'Especialidade médica que cuida do coração e do sistema cardiovascular',
              description: 'Descrição da especialização',
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Status da especialização',
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
            },
          },
        },
      }),
<<<<<<< HEAD
      ApiResponse({ status: 201, description: 'Especialização criada' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar especializações' }),
      ApiQuery({ name: 'isActive', required: false, type: 'boolean' }),
      ApiResponse({ status: 200, description: 'Lista de especializações' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar especialização por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Especialização encontrada' }),
      ApiResponse({ status: 404, description: 'Não encontrada' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar especialização' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Atualizada com sucesso' }),
      ApiResponse({ status: 404, description: 'Não encontrada' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Excluir especialização' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Excluída com sucesso' }),
      ApiResponse({ status: 404, description: 'Não encontrada' }),
    ),
};

export const ApiDoctorSpecializationOperations = {
  create: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular médico a especialização' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['doctorId', 'specializationId'],
          properties: {
            doctorId: { type: 'string' },
            specializationId: { type: 'string' },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Vínculo criado' }),
    ),

  findByDoctor: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar especializações de um médico' }),
      ApiParam({ name: 'doctorId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findBySpecialization: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar médicos de uma especialização' }),
      ApiParam({ name: 'specializationId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar vínculo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo encontrado' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover vínculo médico-especialização' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Removido com sucesso' }),
      ApiResponse({ status: 404, description: 'Não encontrado' }),
=======
      ApiResponse({
        status: 201,
        description: 'Especialização criada com sucesso',
      }),
      ApiResponse({
        status: 400,
        description: 'Dados inválidos ou especialização já existe',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  findAllSpecializations: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar todas as especializações',
        description:
          'Retorna lista de todas as especializações ativas. Requer role **ADMIN, DOCTOR ou NURSE**.',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de especializações retornada com sucesso',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  findSpecializationById: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Buscar especialização por ID',
        description:
          'Retorna detalhes de uma especialização específica. Requer role **ADMIN, DOCTOR ou NURSE**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID da especialização',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({
        status: 200,
        description: 'Especialização encontrada',
      }),
      ApiResponse({
        status: 404,
        description: 'Especialização não encontrada',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  updateSpecialization: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Atualizar especialização',
        description:
          'Atualiza os dados de uma especialização existente. Requer role **ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID da especialização',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({
        status: 200,
        description: 'Especialização atualizada com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Especialização não encontrada',
      }),
      ApiResponse({
        status: 400,
        description: 'Dados inválidos',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  deleteSpecialization: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Deletar especialização',
        description:
          'Desativa uma especialização (soft delete). Requer role **ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID da especialização',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({
        status: 204,
        description: 'Especialização deletada com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Especialização não encontrada',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
>>>>>>> 091e88224f787dc72cf54e381bffce0badde806a
    ),
};
