import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiPrescriptionOperations = {
  create: () =>
    applyDecorators(
      ApiTags('prescriptions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar prescrição',
        description:
          'Cria uma prescrição médica. Requer role **DOCTOR** ou **ADMIN**.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: [
            'patientId',
            'doctorId',
            'unitId',
            'medication',
            'dosage',
            'frequency',
            'duration',
          ],
          properties: {
            patientId: { type: 'string', example: 'clxyz123456789' },
            doctorId: { type: 'string', example: 'clxyz123456789' },
            unitId: { type: 'string', example: 'clxyz123456789' },
            medication: { type: 'string', example: 'Amoxicilina' },
            dosage: { type: 'string', example: '500mg' },
            frequency: { type: 'string', example: 'A cada 8 horas' },
            duration: { type: 'string', example: '7 dias' },
            instructions: { type: 'string', example: 'Tomar com água' },
            prescribedAt: { type: 'string', format: 'date-time' },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Prescrição criada com sucesso',
      }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('prescriptions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar prescrições por paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Lista de prescrições do paciente',
      }),
    ),

  findByDoctor: () =>
    applyDecorators(
      ApiTags('prescriptions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar prescrições por médico' }),
      ApiParam({ name: 'doctorId', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Lista de prescrições do médico',
      }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('prescriptions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar prescrição por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Prescrição encontrada' }),
      ApiResponse({ status: 404, description: 'Prescrição não encontrada' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('prescriptions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar prescrição' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 200,
        description: 'Prescrição atualizada com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Prescrição não encontrada' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('prescriptions'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover prescrição' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({
        status: 204,
        description: 'Prescrição removida com sucesso',
      }),
      ApiResponse({ status: 404, description: 'Prescrição não encontrada' }),
    ),
};
