import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UnitType } from '../../enums/unit.enum';
import { SUPER_ADMIN_FORBIDDEN_DESCRIPTION } from '../schemas/auth-user.schema';

const unitSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'cmjhiz9ng0005i4pwx634gkuh' },
    name: { type: 'string', example: 'Hospital SÃ£o JosÃ©' },
    type: {
      type: 'string',
      enum: Object.values(UnitType),
      example: UnitType.HOSPITAL,
    },
    address: { type: 'string', example: 'Rua das Flores, 123' },
    city: { type: 'string', example: 'SÃ£o Paulo' },
    state: { type: 'string', example: 'SP' },
    zipCode: { type: 'string', example: '01234567' },
    phone: { type: 'string', example: '1133334444' },
    email: { type: 'string', example: 'contato@hospitalsaojose.com.br' },
    cnpj: { type: 'string', example: '12345678000190' },
    description: {
      type: 'string',
      example: 'Unidade especializada em cardiologia',
      nullable: true,
    },
    isActive: { type: 'boolean', example: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

const authResponses = [
  ApiResponse({
    status: 401,
    description: 'NÃ£o autenticado â€” token JWT ausente ou invÃ¡lido',
  }),
  ApiResponse({
    status: 403,
    description: SUPER_ADMIN_FORBIDDEN_DESCRIPTION,
  }),
];

export const ApiUnitOperations = {
  createUnit: () =>
    applyDecorators(
      ApiTags('units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar unidade',
        description:
          'Cria uma nova unidade (hospital, clínica, etc.). **Apenas SUPER_ADMIN** — gestão global da plataforma.',
      }),
      ApiBody({
        description: 'Dados para criaÃ§Ã£o da unidade',
        schema: {
          type: 'object',
          required: [
            'name',
            'type',
            'address',
            'city',
            'state',
            'zipCode',
            'phone',
            'email',
            'cnpj',
          ],
          properties: {
            name: { type: 'string', example: 'Hospital SÃ£o JosÃ©' },
            type: {
              type: 'string',
              enum: Object.values(UnitType),
              example: UnitType.HOSPITAL,
              description: 'Tipo da unidade',
            },
            address: { type: 'string', example: 'Rua das Flores, 123' },
            city: { type: 'string', example: 'SÃ£o Paulo' },
            state: { type: 'string', example: 'SP' },
            zipCode: { type: 'string', example: '01234567' },
            phone: { type: 'string', example: '1133334444' },
            email: {
              type: 'string',
              format: 'email',
              example: 'contato@hospitalsaojose.com.br',
            },
            cnpj: { type: 'string', example: '12345678000190' },
            description: {
              type: 'string',
              example: 'Unidade especializada em cardiologia',
              nullable: true,
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Unidade criada com sucesso',
        schema: unitSchema,
      }),
      ApiResponse({
        status: 400,
        description: 'Dados invÃ¡lidos',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'string',
              example: 'Erro de validaÃ§Ã£o nos campos: name, cnpj',
            },
            errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          },
        },
      }),
      ...authResponses,
    ),

  findUnitById: () =>
    applyDecorators(
      ApiTags('units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Buscar unidade por ID',
        description:
          'Retorna os dados de uma unidade pelo ID. **Apenas SUPER_ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID Ãºnico da unidade',
        example: 'cmjhiz9ng0005i4pwx634gkuh',
        type: 'string',
      }),
      ApiResponse({
        status: 200,
        description: 'Unidade encontrada com sucesso',
        schema: unitSchema,
      }),
      ApiResponse({
        status: 404,
        description: 'Unidade nÃ£o encontrada',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: {
              type: 'string',
              example:
                'Nenhuma unidade encontrada com o ID: cmjhiz9ng0005i4pwx634gkuh',
            },
            errorCode: { type: 'string', example: 'UNIT_NOT_FOUND' },
          },
        },
      }),
      ...authResponses,
    ),

  updateUnit: () =>
    applyDecorators(
      ApiTags('units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Atualizar unidade',
        description:
          'Atualiza os dados de uma unidade existente. **Apenas SUPER_ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID Ãºnico da unidade',
        example: 'cmjhiz9ng0005i4pwx634gkuh',
        type: 'string',
      }),
      ApiBody({
        description: 'Campos a atualizar (todos opcionais)',
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Hospital SÃ£o JosÃ© - Unidade Central',
            },
            type: {
              type: 'string',
              enum: Object.values(UnitType),
              example: UnitType.HOSPITAL,
            },
            address: { type: 'string', example: 'Rua das Palmeiras, 456' },
            city: { type: 'string', example: 'SÃ£o Paulo' },
            state: { type: 'string', example: 'SP' },
            zipCode: { type: 'string', example: '01234567' },
            phone: { type: 'string', example: '1133335555' },
            email: {
              type: 'string',
              format: 'email',
              example: 'contato@hospitalsaojose.com.br',
            },
            cnpj: { type: 'string', example: '12345678000190' },
            description: {
              type: 'string',
              example: 'Unidade especializada em cardiologia e oncologia',
              nullable: true,
            },
            isActive: { type: 'boolean', example: true },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Unidade atualizada com sucesso',
        schema: unitSchema,
      }),
      ApiResponse({
        status: 400,
        description: 'Dados invÃ¡lidos',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'string',
              example: 'Erro de validaÃ§Ã£o nos campos: email',
            },
            errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Unidade nÃ£o encontrada',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: {
              type: 'string',
              example:
                'Nenhuma unidade encontrada com o ID: cmjhiz9ng0005i4pwx634gkuh',
            },
            errorCode: { type: 'string', example: 'UNIT_NOT_FOUND' },
          },
        },
      }),
      ...authResponses,
    ),

  deleteUnit: () =>
    applyDecorators(
      ApiTags('units'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Excluir unidade',
        description:
          'Remove uma unidade do sistema (soft delete). **Apenas SUPER_ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID Ãºnico da unidade',
        example: 'cmjhiz9ng0005i4pwx634gkuh',
        type: 'string',
      }),
      ApiResponse({
        status: 204,
        description: 'Unidade excluÃ­da com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Unidade nÃ£o encontrada',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: {
              type: 'string',
              example:
                'Nenhuma unidade encontrada com o ID: cmjhiz9ng0005i4pwx634gkuh',
            },
            errorCode: { type: 'string', example: 'UNIT_NOT_FOUND' },
          },
        },
      }),
      ...authResponses,
    ),
};
