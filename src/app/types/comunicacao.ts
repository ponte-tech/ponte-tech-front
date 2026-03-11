// Tipos de mensagem
export type MessageDirection = "inbound" | "outbound";
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

// Entidade de Mensagem
export interface Message {
  message_id: string;
  phone: string;
  message: string;
  direction: MessageDirection;
  status: MessageStatus;
  sender_name?: string;
  sent_by?: string;
  created_at: string;
  updated_at?: string;
}

// Entidade de Conversa
export interface Conversation {
  phone: string;
  name: string;
  colaborador_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at?: string;
}

// Request de envio de mensagem individual
export interface SendMessageRequest {
  phone: string;
  message: string;
}

// Response de envio de mensagem individual
export interface SendMessageResponse {
  message_id: string;
  phone: string;
  status: MessageStatus;
  sent_at: string;
}

// Request de envio em massa (broadcast)
export interface BroadcastMessageRequest {
  collaborator_ids?: string[];
  send_to_all?: boolean;
  department?: string;
  message: string;
}

// Falha no envio de broadcast
export interface BroadcastFailure {
  phone: string;
  name: string;
  error: string;
}

// Response de envio em massa (broadcast)
export interface BroadcastMessageResponse {
  total_queued: number;
  total_sent: number;
  total_failed: number;
  failures: BroadcastFailure[];
}

// Request de marcar como lido
export interface MarkAsReadRequest {
  phone: string;
}

// Response de listagem de conversas
export interface ListConversationsResponse {
  conversations: Conversation[];
  total: number;
}

// Response de listagem de mensagens
export interface ListMessagesResponse {
  messages: Message[];
  phone: string;
  contact_name?: string;
}

// Filtros para listagem
export interface ConversationFilters {
  limit?: number;
  offset?: number;
}

export interface MessageFilters {
  phone: string;
  limit?: number;
  offset?: number;
}
