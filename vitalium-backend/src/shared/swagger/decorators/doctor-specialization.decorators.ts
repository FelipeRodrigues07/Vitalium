import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

export const ApiDoctorSpecializationOperations = {
  createDoctorSpecialization: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Vincular médico a uma especialização',
        description:
          'Cria um vínculo entre um médico e uma especialização. Requer role **ADMIN**.',
      }),
      ApiBody({
        description: 'Dados para criação do vínculo',
        schema: {
          type: 'object',
          required: ['doctorId', 'specializationId'],
          properties: {
            doctorId: {
              type: 'string',
              example: 'clxyz123456789abcdef',
              description: 'ID do médico',
            },
            specializationId: {
              type: 'string',
              example: 'clxyz987654321zyxlc',
              description: 'ID da especialização',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Vínculo criado com sucesso',
      }),
      ApiResponse({
        status: 400,
        description: 'Dados inválidos ou vínculo já existe',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  findDoctorSpecializationsByDoctorId: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar especializações de um médico',
        description:
          'Retorna todas as especializações vinculadas a um médico. Requer role **ADMIN, DOCTOR ou NURSE**.',
      }),
      ApiParam({
        name: 'doctorId',
        description: 'ID do médico',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de especializações retornada com sucesso',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  findDoctorSpecializationsBySpecializationId: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar médicos de uma especialização',
        description:
          'Retorna todos os médicos vinculados a uma especialização. Requer role **ADMIN, DOCTOR ou NURSE**.',
      }),
      ApiParam({
        name: 'specializationId',
        description: 'ID da especialização',
        example: 'clxyz987654321zyxlc',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de médicos retornada com sucesso',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),

  deleteDoctorSpecialization: () =>
    applyDecorators(
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Remover vínculo médico-especialização',
        description:
          'Remove o vínculo entre um médico e uma especialização. Requer role **ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID do vínculo médico-especialização',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({
        status: 204,
        description: 'Vínculo removido com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Vínculo não encontrado',
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão',
      }),
    ),
};
