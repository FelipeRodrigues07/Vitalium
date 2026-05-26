import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiPatientDoctorOperations = {
  create: () =>
    applyDecorators(
      ApiTags('patient-doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Vincular paciente a médico (médico responsável)',
        description:
          'Encerra vínculos ativos anteriores do paciente e define o médico responsável. Valida unidade quando unitId é enviado.',
      }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['patientId', 'doctorId'],
          properties: {
            patientId: { type: 'string' },
            doctorId: { type: 'string' },
            unitId: {
              type: 'string',
              description:
                'Unidade para validar vínculo paciente/médico (recomendado)',
            },
            startDate: { type: 'string', format: 'date-time' },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Vínculo criado' }),
    ),

  findByPatient: () =>
    applyDecorators(
      ApiTags('patient-doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar médicos de um paciente' }),
      ApiParam({ name: 'patientId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findByDoctor: () =>
    applyDecorators(
      ApiTags('patient-doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar pacientes de um médico' }),
      ApiParam({ name: 'doctorId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de vínculos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('patient-doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar vínculo por ID' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo encontrado' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiTags('patient-doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Encerrar vínculo (definir data de fim)' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Vínculo atualizado' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('patient-doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover vínculo paciente-médico' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Vínculo removido' }),
      ApiResponse({ status: 404, description: 'Vínculo não encontrado' }),
    ),
};
