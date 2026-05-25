import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiPatientUnitOperations = {
  create: () =>
    applyDecorators(
      ApiTags('patient-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular paciente a unidade de saúde' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['patientId', 'unitId'],
          properties: {
            patientId: { type: 'string' },
            unitId: { type: 'string' },
            isPrimary: { type: 'boolean', default: false },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Vínculo criado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('patient-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar unidades de um paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findByUnit: () =>
    applyDecorators(
      ApiTags('patient-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar pacientes de uma unidade' }),
      ApiParam({ name: 'unitId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('patient-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar vínculo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo encontrado' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('patient-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Atualizar vínculo (isPrimary / isActive)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo atualizado' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('patient-units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover vínculo paciente-unidade' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Vínculo removido' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),
};
