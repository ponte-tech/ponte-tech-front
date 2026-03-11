import api from "./api";
import { ApiResponse } from "../types/api";
import {
  SendMessageRequest,
  SendMessageResponse,
  BroadcastMessageRequest,
  BroadcastMessageResponse,
  ListConversationsResponse,
  ListMessagesResponse,
  MarkAsReadRequest,
  ConversationFilters,
  MessageFilters,
} from "../types/comunicacao";
import { AxiosResponse } from "axios";

class ComunicacaoService {
  /**
   * Envia mensagem individual para um número
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      // Backend espera Phone e Message com letra maiúscula
      const payload = {
        Phone: data.phone,
        Message: data.message,
      };

      const response: AxiosResponse<ApiResponse<SendMessageResponse>> = await api.post(
        "/api/comunicacao/messages/send",
        payload
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao enviar mensagem");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Envia mensagem em massa (broadcast) para colaboradores
   */
  async broadcastMessage(data: BroadcastMessageRequest): Promise<BroadcastMessageResponse> {
    try {
      const response: AxiosResponse<ApiResponse<BroadcastMessageResponse>> = await api.post(
        "/api/comunicacao/messages/broadcast",
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao enviar mensagens em massa");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Lista todas as conversas
   */
  async listConversations(filters?: ConversationFilters): Promise<ListConversationsResponse> {
    try {
      const response: AxiosResponse<ApiResponse<ListConversationsResponse>> = await api.get(
        "/api/comunicacao/conversations",
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao listar conversas");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Lista mensagens de uma conversa específica
   */
  async listMessages(phone: string, filters?: Omit<MessageFilters, "phone">): Promise<ListMessagesResponse> {
    try {
      const response: AxiosResponse<ApiResponse<ListMessagesResponse>> = await api.get(
        `/api/comunicacao/conversations/${phone}/messages`,
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao listar mensagens");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Marca conversa como lida
   */
  async markAsRead(data: MarkAsReadRequest): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await api.post(
        "/api/comunicacao/conversations/mark-read",
        data
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao marcar como lida");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}

// Exportar instância única (singleton)
const comunicacaoService = new ComunicacaoService();
export default comunicacaoService;
