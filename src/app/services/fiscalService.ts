import api from "./api";
import {
  ApiResponse,
  NotaFiscalResponse,
  NotaFiscalListResponse,
  UpdateNotaFiscalRequest,
  AtualizarStatusNotaRequest,
  DownloadZipRequest,
  FiscalConfigRequest,
  FiscalConfigResponse,
  ArquivoFiscalResponse,
} from "../types/api";
import { AxiosResponse } from "axios";

interface ListNotasFilters {
  ano_mes?: string;
  status?: string;
  numero_nota?: string;
}

interface AdminListNotasFilters {
  status?: string;
  user_id?: string;
  ano_mes?: string;
}

class FiscalService {
  // ===== COLABORADOR =====

  async createNota(formData: FormData): Promise<NotaFiscalResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalResponse>> = await api.post(
      "/api/colaborador/fiscal/notas",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar nota fiscal");
    }

    return response.data.data;
  }

  async listNotas(filters?: ListNotasFilters): Promise<NotaFiscalListResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalListResponse>> = await api.get(
      "/api/colaborador/fiscal/notas",
      { params: filters }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar notas fiscais");
    }

    return response.data.data;
  }

  async getNota(id: string): Promise<NotaFiscalResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalResponse>> = await api.get(
      `/api/colaborador/fiscal/notas/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao obter nota fiscal");
    }

    return response.data.data;
  }

  async updateNota(id: string, data: UpdateNotaFiscalRequest): Promise<NotaFiscalResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalResponse>> = await api.put(
      `/api/colaborador/fiscal/notas/${id}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao atualizar nota fiscal");
    }

    return response.data.data;
  }

  async deleteNota(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/api/colaborador/fiscal/notas/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao excluir nota fiscal");
    }
  }

  async addFiles(notaId: string, formData: FormData): Promise<ArquivoFiscalResponse[]> {
    const response: AxiosResponse<
      ApiResponse<{ nota_id: string; arquivos: ArquivoFiscalResponse[] }>
    > = await api.post(`/api/colaborador/fiscal/notas/${notaId}/arquivos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao adicionar arquivos");
    }

    return response.data.data.arquivos;
  }

  async deleteFile(notaId: string, arquivoId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/api/colaborador/fiscal/notas/${notaId}/arquivos/${arquivoId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao excluir arquivo");
    }
  }

  getDownloadUrl(notaId: string, arquivoId: string): string {
    const baseURL = api.defaults.baseURL || "";
    return `${baseURL}/api/colaborador/fiscal/notas/${notaId}/arquivos/${arquivoId}/download`;
  }

  // ===== ADMIN =====

  async adminListNotas(filters?: AdminListNotasFilters): Promise<NotaFiscalListResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalListResponse>> = await api.get(
      "/api/admin/fiscal/notas",
      { params: filters }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar notas fiscais");
    }

    return response.data.data;
  }

  async adminUpdateStatus(
    notaId: string,
    data: AtualizarStatusNotaRequest
  ): Promise<NotaFiscalResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalResponse>> = await api.put(
      `/api/admin/fiscal/notas/${notaId}/status`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao atualizar status da nota");
    }

    return response.data.data;
  }

  async adminDownloadZip(data: DownloadZipRequest): Promise<Blob> {
    const response = await api.post("/api/admin/fiscal/notas/arquivos/download-zip", data, {
      responseType: "blob",
    });

    return response.data;
  }

  async adminUpsertConfig(data: FiscalConfigRequest): Promise<FiscalConfigResponse> {
    const response: AxiosResponse<ApiResponse<FiscalConfigResponse>> = await api.post(
      "/api/admin/fiscal/configuracao",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao salvar configuração");
    }

    return response.data.data;
  }

  async adminGetConfig(): Promise<FiscalConfigResponse> {
    const response: AxiosResponse<ApiResponse<FiscalConfigResponse>> = await api.get(
      "/api/admin/fiscal/configuracao"
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao carregar configuração");
    }

    return response.data.data;
  }

  // ===== CONTADOR =====

  async contadorListNotas(): Promise<NotaFiscalListResponse> {
    const response: AxiosResponse<ApiResponse<NotaFiscalListResponse>> = await api.get(
      "/api/contador/fiscal/notas"
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar notas fiscais");
    }

    return response.data.data;
  }
}

const fiscalService = new FiscalService();
export default fiscalService;
