import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

const conversationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'clxyz123456789abcdef' },
    patientId: { type: 'string', example: 'clxyz123456789abcdef' },
    doctorId: { type: 'string', example: 'clxyz123456789abcdef' },
    channel: { type: 'string', enum: ['WEB', 'WHATSAPP'], example: 'WEB' },
    status: {
      type: 'string',
      enum: ['ACTIVE', 'CLOSED', 'PENDING'],
      example: 'ACTIVE',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const messageSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'clxyz123456789abcdef' },
    conversationId: { type: 'string', example: 'clxyz123456789abcdef' },
    senderId: { type: 'string', example: 'clxyz123456789abcdef' },
    content: { type: 'string', example: 'Olá, como posso ajudá-lo?' },
    origin: {
      type: 'string',
      enum: ['PATIENT', 'DOCTOR', 'AI', 'SYSTEM'],
      example: 'DOCTOR',
    },
    channel: { type: 'string', enum: ['WEB', 'WHATSAPP'], example: 'WEB' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

export const ApiChatOperations = {
  createConversation: () =>
    applyDecorators(
      ApiTags('chat'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Criar nova conversa',
        description: 'Cria uma nova conversa entre médico e paciente.',
      }),
      ApiBody({
        description: 'Dados para criação da conversa',
        schema: {
          type: 'object',
          required: ['patientId', 'doctorId', 'channel'],
          properties: {
            patientId: { type: 'string', example: 'clxyz123456789abcdef' },
            doctorId: { type: 'string', example: 'clxyz123456789abcdef' },
            channel: {
              type: 'string',
              enum: ['WEB', 'WHATSAPP'],
              example: 'WEB',
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Conversa criada com sucesso',
        schema: conversationSchema,
      }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
    ),

  listByDoctor: () =>
    applyDecorators(
      ApiTags('chat'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar conversas de um médico',
        description:
          'Retorna todas as conversas associadas a um médico. Filtrável por status.',
      }),
      ApiParam({
        name: 'doctorId',
        type: String,
        example: 'clxyz123456789abcdef',
      }),
      ApiQuery({
        name: 'status',
        required: false,
        enum: ['ACTIVE', 'CLOSED', 'PENDING'],
        description: 'Filtrar por status da conversa',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de conversas retornada com sucesso',
        schema: { type: 'array', items: conversationSchema },
      }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
    ),

  listByPatient: () =>
    applyDecorators(
      ApiTags('chat'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar conversas de um paciente',
        description:
          'Retorna todas as conversas associadas a um paciente. Filtrável por status.',
      }),
      ApiParam({
        name: 'patientId',
        type: String,
        example: 'clxyz123456789abcdef',
      }),
      ApiQuery({
        name: 'status',
        required: false,
        enum: ['ACTIVE', 'CLOSED', 'PENDING'],
        description: 'Filtrar por status da conversa',
      }),
      ApiResponse({
        status: 200,
        description: 'Lista de conversas retornada com sucesso',
        schema: { type: 'array', items: conversationSchema },
      }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
    ),

  findConversation: () =>
    applyDecorators(
      ApiTags('chat'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Buscar conversa por ID',
        description: 'Retorna os detalhes de uma conversa específica.',
      }),
      ApiParam({ name: 'id', type: String, example: 'clxyz123456789abcdef' }),
      ApiResponse({
        status: 200,
        description: 'Conversa encontrada',
        schema: conversationSchema,
      }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({ status: 404, description: 'Conversa não encontrada' }),
    ),

  sendMessage: () =>
    applyDecorators(
      ApiTags('chat'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Enviar mensagem',
        description:
          'Envia uma mensagem em uma conversa existente. Mensagens de médicos são enviadas via fila de saída.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID da conversa',
        example: 'clxyz123456789abcdef',
      }),
      ApiBody({
        description: 'Dados da mensagem',
        schema: {
          type: 'object',
          required: ['content', 'origin'],
          properties: {
            content: {
              type: 'string',
              example: 'Olá, como posso ajudá-lo?',
            },
            origin: {
              type: 'string',
              enum: ['PATIENT', 'DOCTOR', 'AI', 'SYSTEM'],
              example: 'DOCTOR',
            },
            metadata: {
              type: 'object',
              description: 'Metadados adicionais (opcional)',
              example: {},
            },
          },
        },
      }),
      ApiResponse({
        status: 201,
        description: 'Mensagem enviada com sucesso',
        schema: messageSchema,
      }),
      ApiResponse({ status: 400, description: 'Dados inválidos' }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({ status: 404, description: 'Conversa não encontrada' }),
    ),

  getMessages: () =>
    applyDecorators(
      ApiTags('chat'),
      ApiBearerAuth('JWT-auth'),
      ApiOperation({
        summary: 'Listar mensagens de uma conversa',
        description: 'Retorna as mensagens de uma conversa com paginação.',
      }),
      ApiParam({
        name: 'id',
        description: 'ID da conversa',
        example: 'clxyz123456789abcdef',
      }),
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número da página (padrão: 1)',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Itens por página (padrão: 50)',
        example: 50,
      }),
      ApiResponse({
        status: 200,
        description: 'Mensagens retornadas com sucesso',
        schema: {
          type: 'object',
          properties: {
            messages: { type: 'array', items: messageSchema },
            total: { type: 'number', example: 120 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 50 },
          },
        },
      }),
      ApiResponse({ status: 401, description: 'Não autenticado' }),
      ApiResponse({ status: 404, description: 'Conversa não encontrada' }),
    ),
};
