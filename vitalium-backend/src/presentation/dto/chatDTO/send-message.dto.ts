import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MessageChannel } from '../../../shared/enums/message-channel.enum';
import { MessageOrigin } from '../../../shared/enums/message-origin.enum';

export class SendMessageDTO {
  @ApiProperty({ description: 'Conteúdo da mensagem' })
  @IsString()
  content: string;

  @ApiProperty({ enum: MessageOrigin, description: 'Origem da mensagem' })
  @IsEnum(MessageOrigin)
  origin: MessageOrigin;

  @ApiPropertyOptional({ enum: MessageChannel })
  @IsEnum(MessageChannel)
  @IsOptional()
  channel?: MessageChannel;

  @ApiPropertyOptional({ description: 'ID do remetente (userId)' })
  @IsString()
  @IsOptional()
  senderId?: string;

  @ApiPropertyOptional({ description: 'Metadados adicionais' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}
