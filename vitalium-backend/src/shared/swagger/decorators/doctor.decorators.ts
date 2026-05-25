import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiDoctorOperations = {
  createDoctor: () =>
    applyDecorators(
      ApiTags('doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar novo médico',
        description:
          'Cria um novo médico no sistema com as informações fornecidas. O usuário associado deve ter role DOCTOR. Requer role **ADMIN**.',
      }),
      ApiBody({
        description: 'Dados para criação do médico',
        schema: {
          type: 'object',
          required: ['userId', 'crm', 'crmState', 'isActive'],
          properties: {
            userId: {
              type: 'string',
              example: 'clxyz123456789abcdef',
              description:
                'ID do usuário (com role DOCTOR) a ser associado ao médico',
            },
            crm: {
              type: 'string',
              example: '123456-SP',
              description: 'Número do CRM do médico (único no sistema)',
            },
            crmState: {
              type: 'boolean',
              example: true,
              description: 'Indica se o CRM do médico está ativo',
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Status do perfil do médico (ativo/inativo)',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Médico criado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cmjhja6fv0009n0pwqk73fd82',
              description: 'ID único do médico',
            },
            crm: {
              type: 'string',
              example: '123456-SP',
              description: 'Número do CRM',
            },
            crmState: {
              type: 'boolean',
              example: true,
              description: 'Status do CRM',
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Status do médico',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-22T19:13:07.093Z',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-22T19:13:07.093Z',
              description: 'Data de atualização',
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'cmjhja1is0008n0pwovrcf408',
                },
                firstName: {
                  type: 'string',
                  example: 'João',
                },
                lastName: {
                  type: 'string',
                  example: 'Silva',
                },
                email: {
                  type: 'string',
                  example: 'joaodoctor@exemplo.com',
                },
                phone: {
                  type: 'string',
                  example: '11999939999',
                },
                avatar: {
                  type: 'string',
                  example: 'https://exemplo.com/avatar.jpg',
                },
                role: {
                  type: 'string',
                  example: 'DOCTOR',
                },
                isActive: {
                  type: 'boolean',
                  example: true,
                },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-12-22T19:13:00.724Z',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-12-22T19:13:00.724Z',
                },
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Dados inválidos fornecidos',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'string',
              example: 'Erro de validação nos campos: userId, crm',
            },
            errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Usuário não encontrado ou não possui role DOCTOR',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: { type: 'string', example: 'Usuário não encontrado' },
            errorCode: { type: 'string', example: 'USER_NOT_FOUND' },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN',
      }),
    ),

  findAllDoctors: () =>
    applyDecorators(
      ApiTags('doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar todos os médicos',
        description:
          'Retorna uma lista de todos os médicos cadastrados no sistema. Requer role **ADMIN** ou **NURSE**.',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de médicos retornada com sucesso',
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: 'clxyz123456789abcdef',
                description: 'ID único do médico',
              },
              crm: {
                type: 'string',
                example: '123456-SP',
                description: 'Número do CRM',
              },
              crmState: {
                type: 'boolean',
                example: true,
                description: 'Status do CRM',
              },
              consultationPrice: {
                type: 'number',
                example: 150.0,
                description: 'Preço da consulta',
              },
              isActive: {
                type: 'boolean',
                example: true,
                description: 'Status do perfil',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Data de criação',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Data de atualização',
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN ou NURSE',
      }),
    ),

  findDoctorById: () =>
    applyDecorators(
      ApiTags('doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Buscar médico por ID',
        description:
          'Retorna os dados do médico, usuário associado e unidades vinculadas. Requer role **ADMIN**, **DOCTOR** ou **NURSE**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID único do médico',
        example: 'cmjhja6fv0009n0pwqk73fd82',
        type: 'string',
      }),
      ApiResponse({
        status: 200,
        description: 'Médico encontrado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cmjhja6fv0009n0pwqk73fd82',
            },
            crm: {
              type: 'string',
              example: '123456-SP',
            },
            crmState: {
              type: 'boolean',
              example: true,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },

            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'cmjhja1is0008n0pwovrcf408' },
                email: {
                  type: 'string',
                  example: 'joaodoctor@exemplo.com',
                },
                firstName: { type: 'string', example: 'João Docs' },
                lastName: { type: 'string', example: 'Silva' },
                phone: { type: 'string', example: '11999939999' },
                avatar: {
                  type: 'string',
                  example: 'https://exemplo.com/avatar.jpg',
                },
                role: { type: 'string', example: 'DOCTOR' },
                isActive: { type: 'boolean', example: true },
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },

            units: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: 'cmjiobll4000a34pwwa6xkybe',
                  },
                  doctorId: {
                    type: 'string',
                    example: 'cmjhja6fv0009n0pwqk73fd82',
                  },
                  unitId: {
                    type: 'string',
                    example: 'cmjhiz9ng0005i4pwx634gkuh',
                  },
                  consultationPrice: {
                    type: 'number',
                    example: 150,
                  },
                  isPrimary: {
                    type: 'boolean',
                    example: true,
                  },
                  isActive: {
                    type: 'boolean',
                    example: true,
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                  },
                  unit: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        example: 'cmjhiz9ng0005i4pwx634gkuh',
                      },
                      name: {
                        type: 'string',
                        example: 'Hospital São José',
                      },
                      type: {
                        type: 'string',
                        example: 'HOSPITAL',
                      },
                      cnpj: {
                        type: 'string',
                        example: '12345678000190',
                      },
                      phone: {
                        type: 'string',
                        example: '1133334444',
                      },
                      email: {
                        type: 'string',
                        example: 'contato@hospitalsaojose.com.br',
                      },
                      address: {
                        type: 'string',
                        example: 'Rua das Flores, 123',
                      },
                      city: {
                        type: 'string',
                        example: 'São Paulo',
                      },
                      state: {
                        type: 'string',
                        example: 'SP',
                      },
                      zipCode: {
                        type: 'string',
                        example: '01234567',
                      },
                      isActive: {
                        type: 'boolean',
                        example: true,
                      },
                      createdAt: {
                        type: 'string',
                        format: 'date-time',
                      },
                      updatedAt: {
                        type: 'string',
                        format: 'date-time',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Médico não encontrado',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: {
              type: 'string',
              example:
                'Nenhum médico foi encontrado com os critérios: ID cmjhja6fv0009n0pwqk73fd82',
            },
            errorCode: {
              type: 'string',
              example: 'DOCTOR_NOT_FOUND',
            },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN, DOCTOR ou NURSE',
      }),
    ),

  updateDoctor: () =>
    applyDecorators(
      ApiTags('doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Atualizar médico',
        description:
          'Atualiza os dados de um médico existente. Requer role **ADMIN** ou **DOCTOR**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID único do médico',
        example: 'clxyz123456789abcdef',
        type: 'string',
      }),
      ApiBody({
        description: 'Dados para atualização do médico (todos opcionais)',
        schema: {
          type: 'object',
          properties: {
            crm: {
              type: 'string',
              example: '654321-RJ',
              description: 'Número do CRM do médico (opcional)',
            },
            crmState: {
              type: 'boolean',
              example: true,
              description: 'Status do CRM (opcional)',
            },
            consultationPrice: {
              type: 'number',
              example: 200.0,
              description: 'Preço da consulta médica em reais (opcional)',
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Status do perfil do médico (opcional)',
            },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Médico atualizado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxyz123456789abcdef',
              description: 'ID único do médico',
            },
            crm: {
              type: 'string',
              example: '654321-RJ',
              description: 'Número do CRM',
            },
            crmState: {
              type: 'boolean',
              example: true,
              description: 'Status do CRM',
            },
            consultationPrice: {
              type: 'number',
              example: 200.0,
              description: 'Preço da consulta',
            },
            isActive: {
              type: 'boolean',
              example: true,
              description: 'Status do perfil',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
            },
          },
        },
      }),
      ApiResponse({
        status: 400,
        description: 'Dados inválidos fornecidos',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'string',
              example: 'Erro de validação nos campos: consultationPrice',
            },
            errorCode: { type: 'string', example: 'VALIDATION_ERROR' },
          },
        },
      }),
      ApiResponse({
        status: 404,
        description: 'Médico não encontrado',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: {
              type: 'string',
              example:
                'Nenhum médico foi encontrado com os critérios: ID: clxyz123456789abcdef',
            },
            errorCode: { type: 'string', example: 'DOCTOR_NOT_FOUND' },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN ou DOCTOR',
      }),
    ),

  deleteDoctor: () =>
    applyDecorators(
      ApiTags('doctors'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Excluir médico',
        description:
          'Remove um médico do sistema (soft delete). Requer role **ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID único do médico',
        example: 'clxyz123456789abcdef',
        type: 'string',
      }),
      ApiResponse({
        status: 204,
        description: 'Médico excluído com sucesso',
      }),
      ApiResponse({
        status: 404,
        description: 'Médico não encontrado',
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: {
              type: 'string',
              example:
                'Nenhum médico foi encontrado com os critérios: ID: clxyz123456789abcdef',
            },
            errorCode: { type: 'string', example: 'DOCTOR_NOT_FOUND' },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Não autenticado — token JWT ausente ou inválido',
      }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN',
      }),
    ),
};
