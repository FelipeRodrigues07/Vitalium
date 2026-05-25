import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export const ApiMedicalRecordOperations = {
  create: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar prontuário médico',
        description:
          'Cria um novo prontuário para um paciente. Requer role **DOCTOR** ou **ADMIN**.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: [
            'patientId',
            'doctorId',
            'title',
            'description',
            'recordType',
          ],
          properties: {
            patientId: { type: 'string', example: 'clxyz123456789' },
            doctorId: { type: 'string', example: 'clxyz123456789' },
            title: { type: 'string', example: 'Consulta de rotina' },
            description: {
              type: 'string',
              example: 'Paciente apresentou sintomas de gripe',
            },
            diagnosis: { type: 'string', example: 'Gripe influenza' },
            symptoms: {
              type: 'array',
              items: { type: 'string' },
              example: ['febre', 'tosse'],
            },
            treatment: { type: 'string', example: 'Repouso e hidratação' },
            observations: { type: 'string', example: 'Retorno em 7 dias' },
            recordDate: { type: 'string', example: '2026-05-25' },
            recordType: {
              type: 'string',
              enum: [
                'CONSULTATION',
                'EXAMINATION',
                'SURGERY',
                'EMERGENCY',
                'ROUTINE_CHECKUP',
                'FOLLOW_UP',
                'DIAGNOSTIC',
                'OTHER',
              ],
              example: 'CONSULTATION',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Prontuário criado com sucesso',
      }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar prontuários por paciente' }),
      ApiParam({
        name: 'patientId',
        type: 'string',
        description: 'ID do paciente',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de prontuários do paciente',
      }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findByDoctor: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar prontuários por médico' }),
      ApiParam({
        name: 'doctorId',
        type: 'string',
        description: 'ID do médico',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de prontuários do médico',
      }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar prontuário por ID' }),
      ApiParam({ name: 'id', type: 'string', description: 'ID do prontuário' }),
      ApiResponse({ status: 200, description: 'Prontuário encontrado' }),
      ApiResponse({ status: 404, description: 'Prontuário não encontrado' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar prontuário' }),
      ApiParam({ name: 'id', type: 'string', description: 'ID do prontuário' }),
      ApiResponse({
        status: 200,
        description: 'Prontuário atualizado com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Prontuário não encontrado' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover prontuário' }),
      ApiParam({ name: 'id', type: 'string', description: 'ID do prontuário' }),
      ApiResponse({
        status: 204,
        description: 'Prontuário removido com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Prontuário não encontrado' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),
};
