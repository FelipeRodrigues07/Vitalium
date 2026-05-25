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

export const ApiSpecializationOperations = {
  create: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Criar especializa├º├úo m├®dica' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Cardiologia' },
            description: {
              type: 'string',
              example: 'Doen├ºas cardiovasculares',
            },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Especializa├º├úo criada' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar especializa├º├Áes' }),
      ApiQuery({ name: 'isActive', required: false, type: 'boolean' }),
      ApiResponse({ status: 200, description: 'Lista de especializa├º├Áes' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar especializa├º├úo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Especializa├º├úo encontrada' }),
      ApiResponse({ status: 404, description: 'N├úo encontrada' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar especializa├º├úo' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Atualizada com sucesso' }),
      ApiResponse({ status: 404, description: 'N├úo encontrada' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Excluir especializa├º├úo' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Exclu├¡da com sucesso' }),
      ApiResponse({ status: 404, description: 'N├úo encontrada' }),
    ),
};

export const ApiDoctorSpecializationOperations = {
  create: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular m├®dico a especializa├º├úo' }),
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
      ApiResponse({ status: 201, description: 'V├¡nculo criado' }),
    ),

  findByDoctor: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar especializa├º├Áes de um m├®dico' }),
      ApiParam({ name: 'doctorId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de v├¡nculos' }),
    ),

  findBySpecialization: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar m├®dicos de uma especializa├º├úo' }),
      ApiParam({ name: 'specializationId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de v├¡nculos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar v├¡nculo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'V├¡nculo encontrado' }),
      ApiResponse({ status: 404, description: 'N├úo encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('doctor-specializations'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover v├¡nculo m├®dico-especializa├º├úo' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Removido com sucesso' }),
      ApiResponse({ status: 404, description: 'N├úo encontrado' }),
    ),
};
