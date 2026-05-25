import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import type { MessageChannel } from '../../../../shared/enums/message-channel.enum';
import type { MessageOrigin } from '../../../../shared/enums/message-origin.enum';
import type { MessageStatus } from '../../../../shared/enums/message-status.enum';

export class MessageResponseDTO {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  conversationId: string;

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  senderId?: string;

  @ApiProperty()
  @Expose()
  content: string;

  @ApiProperty()
  @Expose()
  origin: MessageOrigin;

  @ApiProperty()
  @Expose()
  channel: MessageChannel;

  @ApiProperty()
  @Expose()
  status: MessageStatus;

  @ApiPropertyOptional()
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  metadata?: Record<string, unknown>;

  @ApiProperty()
  @Expose()
  timestamp: Date;
}
