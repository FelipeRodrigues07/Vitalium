import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import type { ConversationStatus } from '../../../../shared/enums/conversation-status.enum';
import type { MessageChannel } from '../../../../shared/enums/message-channel.enum';

export class ConversationResponseDTO {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  patientId: string;

  @ApiProperty()
  @Expose()
  doctorId: string;

  @ApiProperty()
  @Expose()
  channel: MessageChannel;

  @ApiProperty()
  @Expose()
  status: ConversationStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Total de mensagens não lidas' })
  @Expose()
  @Transform(({ value }) => value ?? undefined)
  unreadCount?: number;
}
