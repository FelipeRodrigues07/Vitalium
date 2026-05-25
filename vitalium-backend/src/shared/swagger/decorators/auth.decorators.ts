import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import {
  authJwtProfileProperties,
  authUserResponseProperties,
} from '../schemas/auth-user.schema';

export const ApiAuthOperations = {
  login: () =>
    applyDecorators(
      ApiTags('auth'),
      ApiOperation({
        summary: 'Login',
        description:
          'Autentica o usuário e retorna access token e refresh token. Para ADMIN, inclui adminRole e unitIds no token e no objeto user.',
      }),
      ApiBody({
        description: 'Credenciais do usuário',
        schema: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@exemplo.com',
            },
            password: {
              type: 'string',
              example: 'MinhaSenh@123',
              minLength: 8,
            },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGci...' },
            refreshToken: { type: 'string', example: 'eyJhbGci...' },
            user: {
              type: 'object',
              properties: authUserResponseProperties,
            },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Credenciais inválidas' }),
    ),

  refreshToken: () =>
    applyDecorators(
      ApiTags('auth'),
      ApiOperation({
        summary: 'Renovar access token',
        description:
          'Gera um novo access token a partir de um refresh token válido',
      }),
      ApiBody({
        description: 'Refresh token',
        schema: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGci...' },
          },
        },
      }),
      ApiResponse({
        status: 200,
        description: 'Access token renovado com sucesso',
        schema: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGci...' },
          },
        },
      }),
      ApiResponse({
        status: 401,
        description: 'Refresh token inválido ou expirado',
      }),
    ),

  logout: () =>
    applyDecorators(
      ApiTags('auth'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Logout',
        description: 'Invalida o refresh token do usuário',
      }),
      ApiResponse({ status: 204, description: 'Logout realizado com sucesso' }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),

  profile: () =>
    applyDecorators(
      ApiTags('auth'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Perfil do usuário autenticado',
        description:
          'Retorna o payload do JWT (inclui adminRole e unitIds quando role é ADMIN)',
      }),
      ApiResponse({
        status: 200,
        description: 'Dados do usuário autenticado',
        schema: {
          type: 'object',
          properties: authJwtProfileProperties,
        },
      }),
      ApiResponse({ status: 401, description: 'Não autorizado' }),
    ),
};
