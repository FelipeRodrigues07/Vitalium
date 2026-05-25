import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { Message } from '../../infrastructure/database/models/message.models';

/**
 * Gateway WebSocket para chat em tempo real.
 * Rooms são baseadas no conversationId.
 *
 * Eventos client → server:
 *   join_conversation  { conversationId }  → entra na sala
 *   leave_conversation { conversationId }  → sai da sala
 *
 * Eventos server → client:
 *   new_message        MessageResponseDTO  → nova mensagem na conversa
 *   message_status     { id, status }      → atualização de status
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_conversation')
  handleJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(data.conversationId);
    this.logger.log(
      `Cliente ${client.id} entrou na sala ${data.conversationId}`,
    );
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.leave(data.conversationId);
  }

  /**
   * Emite uma nova mensagem para todos os participantes da conversa.
   * Chamado pelos use-cases e consumers de fila.
   */
  emitNewMessage(conversationId: string, message: Message): void {
    this.server.to(conversationId).emit('new_message', message);
  }

  /**
   * Emite atualização de status de uma mensagem.
   */
  emitMessageStatus(
    conversationId: string,
    messageId: string,
    status: string,
  ): void {
    this.server.to(conversationId).emit('message_status', {
      id: messageId,
      status,
    });
  }
}
