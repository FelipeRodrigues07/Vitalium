import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { MessageChannel } from '../../../shared/enums/message-channel.enum';

export class CreateConversationDTO {
  @ApiProperty({ description: 'ID do paciente' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'ID do médico' })
  @IsString()
  doctorId: string;

  @ApiProperty({
    enum: MessageChannel,
    description: 'Canal principal da conversa',
  })
  @IsEnum(MessageChannel)
  channel: MessageChannel;
}
