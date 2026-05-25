import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateConversationUseCase } from '../../../application/use-cases/chat/create-conversation.use-case';
import { GetConversationUseCase } from '../../../application/use-cases/chat/get-conversation.use-case';
import { ListConversationsUseCase } from '../../../application/use-cases/chat/list-conversations.use-case';
import { SendMessageUseCase } from '../../../application/use-cases/chat/send-message.use-case';
import { ConversationStatus } from '../../../shared/enums/conversation-status.enum';
import { MessageOrigin } from '../../../shared/enums/message-origin.enum';
import { ChatGateway } from '../../../shared/gateways/chat.gateway';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { ChatProducer } from '../../../shared/messaging/producers/chat.producer';
import { ApiChatOperations } from '../../../shared/swagger/decorators/chat.decorators';
import { CreateConversationDTO } from '../../dto/chatDTO/create-conversation.dto';
import { ConversationResponseDTO } from '../../dto/chatDTO/response/conversation-response.dto';
import { MessageResponseDTO } from '../../dto/chatDTO/response/message-response.dto';
import { SendMessageDTO } from '../../dto/chatDTO/send-message.dto';

interface AuthenticatedRequest extends Request {
  user: { sub: string; role: string };
}

@ApiTags('chat')
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getConversationUseCase: GetConversationUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly chatGateway: ChatGateway,
    private readonly chatProducer: ChatProducer,
  ) {}

  // ─── Conversas ──────────────────────────────────────────────

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiChatOperations.createConversation()
  async createConversation(
    @Body() dto: CreateConversationDTO,
  ): Promise<ConversationResponseDTO> {
    const conversation = await this.createConversationUseCase.execute(dto);
    return plainToInstance(ConversationResponseDTO, conversation, {
      excludeExtraneousValues: true,
    });
  }

  @Get('conversations/doctor/:doctorId')
  @HttpCode(HttpStatus.OK)
  @ApiChatOperations.listByDoctor()
  async listByDoctor(
    @Param('doctorId') doctorId: string,
    @Query('status') status?: ConversationStatus,
  ): Promise<ConversationResponseDTO[]> {
    const conversations = await this.listConversationsUseCase.byDoctor(
      doctorId,
      status,
    );
    return plainToInstance(ConversationResponseDTO, conversations, {
      excludeExtraneousValues: true,
    });
  }

  @Get('conversations/patient/:patientId')
  @HttpCode(HttpStatus.OK)
  @ApiChatOperations.listByPatient()
  async listByPatient(
    @Param('patientId') patientId: string,
    @Query('status') status?: ConversationStatus,
  ): Promise<ConversationResponseDTO[]> {
    const conversations = await this.listConversationsUseCase.byPatient(
      patientId,
      status,
    );
    return plainToInstance(ConversationResponseDTO, conversations, {
      excludeExtraneousValues: true,
    });
  }

  @Get('conversations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiChatOperations.findConversation()
  async findConversation(
    @Param('id') id: string,
  ): Promise<ConversationResponseDTO> {
    const conversation = await this.getConversationUseCase.findById(id);
    return plainToInstance(ConversationResponseDTO, conversation, {
      excludeExtraneousValues: true,
    });
  }

  // ─── Mensagens ───────────────────────────────────────────────

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiChatOperations.sendMessage()
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDTO,
    @Request() req: AuthenticatedRequest,
  ): Promise<MessageResponseDTO> {
    const senderId = req.user.sub;

    const message = await this.sendMessageUseCase.execute(
      conversationId,
      dto,
      senderId,
    );

    // Notifica participantes via WebSocket
    this.chatGateway.emitNewMessage(conversationId, message);

    // Se for mensagem do médico, envia ao paciente via fila de saída
    if (dto.origin === MessageOrigin.DOCTOR) {
      await this.chatProducer.publishToOutgoing({
        channel: message.channel as 'WHATSAPP' | 'WEB',
        patientId: '', // Preenchido pelo consumer com base na conversa
        conversationId,
        message: message.content,
        timestamp: message.timestamp.toISOString(),
        origin: 'DOCTOR',
        metadata: dto.metadata,
      });
    }

    return plainToInstance(MessageResponseDTO, message, {
      excludeExtraneousValues: true,
    });
  }

  @Get('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiChatOperations.getMessages()
  async getMessages(
    @Param('id') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ): Promise<{
    messages: MessageResponseDTO[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.getConversationUseCase.findMessages(
      conversationId,
      Number(page),
      Number(limit),
    );

    return {
      ...result,
      messages: plainToInstance(MessageResponseDTO, result.messages, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
