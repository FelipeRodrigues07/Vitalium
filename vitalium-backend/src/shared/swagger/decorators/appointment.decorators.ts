import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export const ApiAppointmentOperations = {
  create: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar consulta',
        description:
          'Agenda uma nova consulta. Requer role **DOCTOR** ou **ADMIN**.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: [
            'patientId',
            'doctorId',
            'unitId',
            'title',
            'scheduledAt',
            'type',
          ],
          properties: {
            patientId: { type: 'string', example: 'clxyz123456789' },
            doctorId: { type: 'string', example: 'clxyz123456789' },
            unitId: { type: 'string', example: 'clxyz123456789' },
            title: { type: 'string', example: 'Consulta cardiológica' },
            description: { type: 'string', example: 'Avaliação de rotina' },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              example: '2026-06-01T09:00:00.000Z',
            },
            duration: { type: 'integer', example: 30 },
            status: {
              type: 'string',
              enum: [
                'SCHEDULED',
                'CONFIRMED',
                'IN_PROGRESS',
                'COMPLETED',
                'CANCELLED',
                'NO_SHOW',
                'RESCHEDULED',
              ],
              example: 'SCHEDULED',
            },
            type: {
              type: 'string',
              enum: [
                'CONSULTATION',
                'FOLLOW_UP',
                'ROUTINE_CHECKUP',
                'EMERGENCY',
                'SURGERY',
                'EXAMINATION',
                'VACCINATION',
                'OTHER',
              ],
              example: 'CONSULTATION',
            },
            price: { type: 'number', example: 200.0 },
            notes: { type: 'string', example: 'Trazer exames anteriores' },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Consulta criada com sucesso' }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar consultas por paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Lista de consultas do paciente',
      }),
    ),

  findByDoctor: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar consultas por médico' }),
      ApiParam({ name: 'doctorId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de consultas do médico' }),
    ),

  findByUnit: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar consultas por unidade' }),
      ApiParam({ name: 'unitId', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Lista de consultas da unidade',
      }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar consulta por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Consulta encontrada' }),
      ApiResponse({ status: 404, description: 'Consulta não encontrada' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar consulta' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Consulta atualizada com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Consulta não encontrada' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('appointments'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover consulta' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 204,
        description: 'Consulta removida com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Consulta não encontrada' }),
    ),
};
