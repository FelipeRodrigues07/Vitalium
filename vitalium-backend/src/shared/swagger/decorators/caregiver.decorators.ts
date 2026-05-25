import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiCaregiverOperations = {
  create: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar cuidador',
        description: 'Cadastra um cuidador. Requer role **ADMIN**.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['userId', 'cpf', 'relationship'],
          properties: {
            userId: { type: 'string', example: 'clxyz123456789' },
            cpf: { type: 'string', example: '12345678901' },
            relationship: {
              type: 'string',
              enum: [
                'PARENT',
                'SPOUSE',
                'CHILD',
                'SIBLING',
                'GUARDIAN',
                'FRIEND',
                'OTHER',
              ],
              example: 'PARENT',
            },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Cuidador criado com sucesso' }),
      ApiResponse({ status: 409, description: 'CPF já cadastrado' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar todos os cuidadores' }),
      ApiResponse({ status: 200, description: 'Lista de cuidadores' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar cuidadores de um paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Lista de cuidadores do paciente',
      }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar cuidador por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Cuidador encontrado' }),
      ApiResponse({ status: 404, description: 'Cuidador não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar cuidador' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Cuidador atualizado com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Cuidador não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover cuidador' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 204,
        description: 'Cuidador removido com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Cuidador não encontrado' }),
    ),

  linkToPatient: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular cuidador a paciente' }),
      ApiParam({ name: 'id', type: 'string', description: 'ID do cuidador' }),
      ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'ID do paciente',
      }),
      ApiResponse({ status: 200, description: 'Vinculado com sucesso' }),
    ),

  unlinkFromPatient: () =>
    applyDecorators(
      ApiTags('caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Desvincular cuidador de paciente' }),
      ApiParam({ name: 'id', type: 'string', description: 'ID do cuidador' }),
      ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'ID do paciente',
      }),
      ApiResponse({ status: 200, description: 'Desvinculado com sucesso' }),
    ),
};
