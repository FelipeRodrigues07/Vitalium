import { api } from "@/services/api/api";

export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "CLOSED";
export type MessageChannel = "WHATSAPP" | "WEB";
export type MessageOrigin = "PATIENT" | "DOCTOR" | "AI" | "SYSTEM";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface Conversation {
  id: string;
  patientId: string;
  doctorId: string;
  channel: MessageChannel;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  content: string;
  origin: MessageOrigin;
  channel: MessageChannel;
  status: MessageStatus;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface SendMessagePayload {
  content: string;
  origin: MessageOrigin;
  channel?: MessageChannel;
  senderId?: string;
  metadata?: Record<string, unknown>;
}

export interface MessagesPage {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateConversationPayload {
  patientId: string;
  doctorId: string;
  channel: MessageChannel;
}

export const chatApi = {
  listByDoctor: (
    doctorId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> =>
    api
      .get<Conversation[]>(`/chat/conversations/doctor/${doctorId}`, {
        params: status ? { status } : {},
      })
      .then((r) => r.data),

  listByPatient: (
    patientId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> =>
    api
      .get<Conversation[]>(`/chat/conversations/patient/${patientId}`, {
        params: status ? { status } : {},
      })
      .then((r) => r.data),

  getConversation: (id: string): Promise<Conversation> =>
    api.get<Conversation>(`/chat/conversations/${id}`).then((r) => r.data),

  getMessages: (
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<MessagesPage> =>
    api
      .get<MessagesPage>(`/chat/conversations/${conversationId}/messages`, {
        params: { page, limit },
      })
      .then((r) => r.data),

  sendMessage: (
    conversationId: string,
    payload: SendMessagePayload,
  ): Promise<Message> =>
    api
      .post<Message>(`/chat/conversations/${conversationId}/messages`, payload)
      .then((r) => r.data),

  createConversation: (
    payload: CreateConversationPayload,
  ): Promise<Conversation> =>
    api.post<Conversation>("/chat/conversations", payload).then((r) => r.data),
};
