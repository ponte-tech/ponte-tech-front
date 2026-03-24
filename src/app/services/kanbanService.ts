import api from "./api";
import {
  Board,
  Column,
  Card,
  CreateBoardRequest,
  UpdateBoardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  AddObservationRequest,
  ListBoardsResponse,
  ListColumnsResponse,
  ListCardsResponse,
} from "../types/kanban";

class KanbanService {
  // Board operations
  async listBoards(): Promise<ListBoardsResponse> {
    const response = await api.get<ListBoardsResponse>("/api/kanban/boards");
    return response.data;
  }

  async getBoard(boardId: string): Promise<Board> {
    const response = await api.get<Board>(`/api/kanban/boards/${encodeURIComponent(boardId)}`);
    return response.data;
  }

  async createBoard(data: CreateBoardRequest): Promise<Board> {
    const response = await api.post<Board>("/api/kanban/boards", data);
    return response.data;
  }

  async updateBoard(boardId: string, data: UpdateBoardRequest): Promise<Board> {
    const response = await api.put<Board>(`/api/kanban/boards/${encodeURIComponent(boardId)}`, data);
    return response.data;
  }

  async deleteBoard(boardId: string): Promise<void> {
    await api.delete(`/api/kanban/boards/${encodeURIComponent(boardId)}`);
  }

  // Column operations
  async listColumnsByBoard(boardId: string): Promise<ListColumnsResponse> {
    const response = await api.get<ListColumnsResponse>(
      `/api/kanban/boards/${encodeURIComponent(boardId)}/columns`
    );
    return response.data;
  }

  async getColumn(columnId: string): Promise<Column> {
    const response = await api.get<Column>(`/api/kanban/columns/${encodeURIComponent(columnId)}`);
    return response.data;
  }

  async createColumn(data: CreateColumnRequest): Promise<Column> {
    const response = await api.post<Column>("/api/kanban/columns", data);
    return response.data;
  }

  async updateColumn(columnId: string, data: UpdateColumnRequest): Promise<Column> {
    const response = await api.put<Column>(`/api/kanban/columns/${encodeURIComponent(columnId)}`, data);
    return response.data;
  }

  async deleteColumn(columnId: string): Promise<void> {
    await api.delete(`/api/kanban/columns/${encodeURIComponent(columnId)}`);
  }

  // Card operations
  async listCardsByColumn(columnId: string): Promise<ListCardsResponse> {
    const response = await api.get<ListCardsResponse>(
      `/api/kanban/columns/${encodeURIComponent(columnId)}/cards`
    );
    return response.data;
  }

  async listCardsByClient(clientID: string): Promise<ListCardsResponse> {
    const response = await api.get<ListCardsResponse>(
      `/api/kanban/clients/${encodeURIComponent(clientID)}/cards`
    );
    return response.data;
  }

  async getCard(cardId: string): Promise<Card> {
    const response = await api.get<Card>(`/api/kanban/cards/${encodeURIComponent(cardId)}`);
    return response.data;
  }

  async createCard(data: CreateCardRequest): Promise<Card> {
    const response = await api.post<Card>("/api/kanban/cards", data);
    return response.data;
  }

  async updateCard(cardId: string, data: UpdateCardRequest): Promise<Card> {
    const response = await api.put<Card>(`/api/kanban/cards/${encodeURIComponent(cardId)}`, data);
    return response.data;
  }

  async deleteCard(cardId: string): Promise<void> {
    await api.delete(`/api/kanban/cards/${encodeURIComponent(cardId)}`);
  }

  async moveCard(cardId: string, data: MoveCardRequest): Promise<Card> {
    const response = await api.post<Card>(
      `/api/kanban/cards/${encodeURIComponent(cardId)}/move`,
      data
    );
    return response.data;
  }

  async addObservation(cardId: string, data: AddObservationRequest): Promise<Card> {
    const response = await api.post<Card>(
      `/api/kanban/cards/${encodeURIComponent(cardId)}/observations`,
      data
    );
    return response.data;
  }

  // Attachment operations
  async initiateAttachmentUpload(
    cardId: string,
    data: {
      nome_arquivo: string;
      tamanho_bytes: number;
      content_type: string;
    }
  ): Promise<{
    attachment_id: string;
    upload_url: string;
    s3_key: string;
  }> {
    const response = await api.post(
      `/api/kanban/cards/${encodeURIComponent(cardId)}/attachments/upload/initiate`,
      data
    );
    return response.data;
  }

  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  async listAttachments(cardId: string): Promise<{
    attachments: Array<{
      attachment_id: string;
      nome_arquivo: string;
      s3_key: string;
      content_type: string;
      tamanho_bytes: number;
      uploaded_by: string;
      uploaded_at: string;
    }>;
  }> {
    const response = await api.get(
      `/api/kanban/cards/${encodeURIComponent(cardId)}/attachments`
    );
    return response.data;
  }

  async downloadAttachment(
    cardId: string,
    attachmentId: string
  ): Promise<{
    download_url: string;
    nome_arquivo: string;
  }> {
    const response = await api.get(
      `/api/kanban/cards/${encodeURIComponent(cardId)}/attachments/${encodeURIComponent(attachmentId)}/download`
    );
    return response.data;
  }

  async deleteAttachment(cardId: string, attachmentId: string): Promise<void> {
    await api.delete(
      `/api/kanban/cards/${encodeURIComponent(cardId)}/attachments/${encodeURIComponent(attachmentId)}`
    );
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "O arquivo não pode ser maior que 10MB" };
    }
    return { valid: true };
  }
}

const kanbanService = new KanbanService();
export default kanbanService;
