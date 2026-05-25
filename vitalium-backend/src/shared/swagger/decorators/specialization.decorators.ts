import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
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
            },
          },
        },
      }),
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
    ),
};
