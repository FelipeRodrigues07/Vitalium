import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export const ApiPatientCaregiverOperations = {
  create: () =>
    applyDecorators(
      ApiTags('patient-caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Vincular paciente a cuidador' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['patientId', 'caregiverId'],
          properties: {
            patientId: { type: 'string' },
            caregiverId: { type: 'string' },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Vínculo criado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('patient-caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar cuidadores de um paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findByCaregiver: () =>
    applyDecorators(
      ApiTags('patient-caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar pacientes de um cuidador' }),
      ApiParam({ name: 'caregiverId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('patient-caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar vínculo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo encontrado' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),

  deactivate: () =>
    applyDecorators(
      ApiTags('patient-caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Desativar vínculo paciente-cuidador' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo desativado' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('patient-caregivers'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover vínculo paciente-cuidador' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Vínculo removido' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),
};
