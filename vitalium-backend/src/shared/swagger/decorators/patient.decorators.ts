import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

export const ApiPatientOperations = {
  createPatient: () =>
    applyDecorators(
      ApiTags('patients'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar novo paciente',
        description:
          'Cria um novo paciente no sistema. O usuário associado deve ter role PATIENT. Requer role **ADMIN**.',
      }),
      ApiBody({
        description: 'Dados para criação do paciente',
        schema: {
          type: 'object',
          required: ['userId', 'cpf', 'birthDate', 'gender'],
          properties: {
            userId: { type: 'string', example: 'clxyz123456789abcdef' },
            cpf: { type: 'string', example: '12345678901' },
            rg: { type: 'string', example: '1234567' },
            birthDate: { type: 'string', example: '1990-05-15' },
            gender: {
              type: 'string',
              example: 'MALE',
              enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
            },
            bloodType: { type: 'string', example: 'O_POSITIVE' },
            allergies: { type: 'string', example: 'Dipirona, Penicilina' },
            emergencyContact: { type: 'string', example: 'Maria Silva' },
            emergencyPhone: { type: 'string', example: '+5511999999999' },
            address: { type: 'string', example: 'Rua das Flores, 123' },
            city: { type: 'string', example: 'São Paulo' },
            state: { type: 'string', example: 'SP' },
            zipCode: { type: 'string', example: '01310-100' },
            whatsappPhone: { type: 'string', example: '+5511999999999' },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Paciente criado com sucesso',
        schema: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxyz123456789abcdef' },
            userId: { type: 'string', example: 'clxyz123456789abcdef' },
            cpf: { type: 'string', example: '12345678901' },
            birthDate: { type: 'string', format: 'date-time' },
            gender: { type: 'string', example: 'MALE' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
            units: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                },
              },
            },
            patientDoctors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  doctorId: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                  },
                  doctor: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      crm: { type: 'string' },
                      user: {
                        type: 'object',
                        properties: {
                          firstName: { type: 'string' },
                          lastName: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN',
      }),
      ApiResponse({ status: 404, description: 'Usuário não encontrado' }),
      ApiResponse({
        status: 409,
        description: 'Paciente com este CPF já existe',
      }),
    ),

  findAllPatients: () =>
    applyDecorators(
      ApiTags('patients'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar todos os pacientes',
        description:
          'Retorna lista de todos os pacientes ativos com usuário, unidades vinculadas e médicos responsáveis. Requer role **ADMIN**, **DOCTOR** ou **NURSE**.',
      }),
      ApiResponse({ status: 200, description: 'Lista retornada com sucesso' }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({ status: 403, description: 'Sem permissão' }),
    ),

  findPatientById: () =>
    applyDecorators(
      ApiTags('patients'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Buscar paciente por ID',
        description:
          'Retorna dados do paciente com usuário, unidades vinculadas e médicos responsáveis. Requer role **ADMIN**, **DOCTOR** ou **NURSE**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID único do paciente',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({ status: 200, description: 'Paciente encontrado' }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({ status: 403, description: 'Sem permissão' }),
      ApiResponse({ status: 404, description: 'Paciente não encontrado' }),
    ),

  updatePatient: () =>
    applyDecorators(
      ApiTags('patients'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Atualizar paciente',
        description:
          'Atualiza dados do paciente. Requer role **ADMIN** ou **DOCTOR**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID único do paciente',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({ status: 200, description: 'Paciente atualizado' }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({ status: 403, description: 'Sem permissão' }),
      ApiResponse({ status: 404, description: 'Paciente não encontrado' }),
    ),

  deletePatient: () =>
    applyDecorators(
      ApiTags('patients'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Remover paciente (soft delete)',
        description:
          'Desativa o paciente no sistema (soft delete). Requer role **ADMIN**.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID único do paciente',
        example: 'clxyz123456789abcdef',
      }),
      ApiResponse({
        status: 204,
        description: 'Paciente removido com sucesso',
      }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({
        status: 403,
        description: 'Sem permissão — requer role ADMIN',
      }),
      ApiResponse({ status: 404, description: 'Paciente não encontrado' }),
    ),
};
