import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export const ApiWardOperations = {
  create: () =>
    applyDecorators(
      ApiTags('wards'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar ala/quarto',
        description:
          'Cria uma ala ou quarto em uma unidade. Requer role **ADMIN**.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['unitId', 'name', 'type', 'capacity'],
          properties: {
            unitId: { type: 'string', example: 'clxyz123456789' },
            name: { type: 'string', example: 'Ala Norte' },
            type: {
              type: 'string',
              enum: [
                'GENERAL',
                'ICU',
                'PEDIATRIC',
                'MATERNITY',
                'SURGERY',
                'EMERGENCY',
                'CARDIOLOGY',
                'ONCOLOGY',
                'OTHER',
              ],
              example: 'GENERAL',
            },
            capacity: { type: 'integer', example: 20 },
            floor: { type: 'string', example: '2' },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Ala criada com sucesso' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findByUnit: () =>
    applyDecorators(
      ApiTags('wards'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar alas por unidade' }),
      ApiParam({ name: 'unitId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de alas da unidade' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('wards'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar ala por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Ala encontrada' }),
      ApiResponse({ status: 404, description: 'Ala não encontrada' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('wards'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar ala' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Ala atualizada com sucesso' }),
      ApiResponse({ status: 404, description: 'Ala não encontrada' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('wards'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover ala' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Ala removida com sucesso' }),
      ApiResponse({ status: 404, description: 'Ala não encontrada' }),
    ),
};

export const ApiWardAdmissionOperations = {
  create: () =>
    applyDecorators(
      ApiTags('ward-admissions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar internação',
        description:
          'Interna um paciente em uma ala. Requer role **DOCTOR** ou **ADMIN**.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['patientId', 'wardId', 'reason'],
          properties: {
            patientId: { type: 'string', example: 'clxyz123456789' },
            wardId: { type: 'string', example: 'clxyz123456789' },
            reason: { type: 'string', example: 'Pneumonia grave' },
            admissionDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'DISCHARGED', 'TRANSFERRED'],
              example: 'ACTIVE',
            },
            notes: { type: 'string', example: 'Paciente em estado grave' },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Internação criada com sucesso',
      }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('ward-admissions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar internações por paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Lista de internações do paciente',
      }),
    ),

  findByWard: () =>
    applyDecorators(
      ApiTags('ward-admissions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar internações por ala' }),
      ApiParam({ name: 'wardId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de internações da ala' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('ward-admissions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar internação por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Internação encontrada' }),
      ApiResponse({ status: 404, description: 'Internação não encontrada' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('ward-admissions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar internação (ex: alta)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Internação atualizada com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Internação não encontrada' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('ward-admissions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover internação' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 204,
        description: 'Internação removida com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Internação não encontrada' }),
    ),
};
