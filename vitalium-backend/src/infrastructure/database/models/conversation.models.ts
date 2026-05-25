import type { ConversationStatus } from '../../../shared/enums/conversation-status.enum';
import type { MessageChannel } from '../../../shared/enums/message-channel.enum';
import type { Message } from './message.models';

export class Conversation {
  id: string;
  patientId: string;
  doctorId: string;
  channel: MessageChannel;
  status: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;

  messages?: Message[];
}
