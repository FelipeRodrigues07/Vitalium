import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

export const ApiMedicalAttachmentOperations = {
  create: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Adicionar anexo ao prontuário' }),
      ApiParam({ name: 'recordId', type: 'string' }),
      ApiBody({
        schema: {
          type: 'object',
          required: ['fileName', 'fileUrl', 'fileType', 'fileSize'],
          properties: {
            fileName: { type: 'string', example: 'exame-sangue.pdf' },
            fileUrl: {
              type: 'string',
              example: 'https://storage.example.com/files/exame-sangue.pdf',
            },
            fileType: { type: 'string', example: 'application/pdf' },
            fileSize: { type: 'integer', example: 204800 },
          },
        },
      }),
      ApiResponse({ status: 201, description: 'Anexo criado com sucesso' }),
      ApiResponse({ status: 404, description: 'Prontuário não encontrado' }),
    ),

  findByRecord: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Listar anexos de um prontuário' }),
      ApiParam({ name: 'recordId', type: 'string' }),
      ApiResponse({ status: 200, description: 'Lista de anexos' }),
    ),

  findById: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Buscar anexo por ID' }),
      ApiParam({ name: 'recordId', type: 'string' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 200, description: 'Anexo encontrado' }),
      ApiResponse({ status: 404, description: 'Anexo não encontrado' }),
    ),

  delete: () =>
    applyDecorators(
      ApiTags('medical-records'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({ summary: 'Remover anexo' }),
      ApiParam({ name: 'recordId', type: 'string' }),
      ApiParam({ name: 'id', type: 'string' }),
      ApiResponse({ status: 204, description: 'Anexo removido' }),
      ApiResponse({ status: 404, description: 'Anexo não encontrado' }),
    ),
};
