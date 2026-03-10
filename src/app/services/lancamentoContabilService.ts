import api from "./api";
import type {
  LancamentoContabil,
  ListLancamentosRequest,
  ListLancamentosResponse,
  CreateLancamentoRequest,
  UpdateValorNotaRequest,
  InitiateUploadNotaRequest,
  InitiateUploadNotaResponse,
  DownloadNotaResponse,
} from "../types/lancamentoContabil";

class LancamentoContabilService {
  private baseUrl = "/api/admin/lancamentos-contabeis";

  /**
   * Lista todos os lançamentos contábeis filtrados por mês/ano
   */
  async list(params: ListLancamentosRequest): Promise<ListLancamentosResponse> {
    console.log("🔍 [LANCAMENTO-CONTABIL-SERVICE] Listando lançamentos para:", params);
    const response = await api.get<any>(`${this.baseUrl}`, { params });
    console.log("🔍 [LANCAMENTO-CONTABIL-SERVICE] Response:", response.data);

    // Compatibilidade com diferentes formatos de resposta
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Cria um novo lançamento contábil
   */
  async create(data: CreateLancamentoRequest): Promise<LancamentoContabil> {
    console.log("➕ [LANCAMENTO-CONTABIL-SERVICE] Criando lançamento:", data);
    const response = await api.post<any>(`${this.baseUrl}`, data);
    console.log("➕ [LANCAMENTO-CONTABIL-SERVICE] Response:", response.data);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Deleta um lançamento contábil
   */
  async delete(lancamentoId: string): Promise<void> {
    console.log("🗑️ [LANCAMENTO-CONTABIL-SERVICE] Deletando lançamento:", lancamentoId);
    await api.delete(`${this.baseUrl}/${lancamentoId}`);
    console.log("🗑️ [LANCAMENTO-CONTABIL-SERVICE] Lançamento deletado");
  }

  /**
   * Atualiza o valor da nota fiscal de um lançamento
   */
  async updateValorNota(
    lancamentoId: string,
    data: UpdateValorNotaRequest
  ): Promise<LancamentoContabil> {
    console.log("💰 [LANCAMENTO-CONTABIL-SERVICE] Atualizando valor:", lancamentoId, data);
    const response = await api.put<any>(
      `${this.baseUrl}/${lancamentoId}/valor`,
      data
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Inicia o upload de uma nota fiscal para o S3
   * Retorna presigned URL para upload direto
   */
  async initiateUpload(
    data: InitiateUploadNotaRequest
  ): Promise<InitiateUploadNotaResponse> {
    console.log("📤 [LANCAMENTO-CONTABIL-SERVICE] Iniciando upload:", data);
    const response = await api.post<any>(
      `${this.baseUrl}/${data.lancamento_id}/notas-fiscais/upload/initiate`,
      {
        mes_referencia: data.mes_referencia,
        arquivo_nome: data.arquivo_nome,
        arquivo_tamanho: data.arquivo_tamanho,
      }
    );

    console.log("📤 [LANCAMENTO-CONTABIL-SERVICE] Response upload:", response.data);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Upload do arquivo PDF para S3 usando presigned URL
   */
  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  }

  /**
   * Obtém URL de download de uma nota fiscal
   */
  async getDownloadUrl(lancamentoId: string): Promise<DownloadNotaResponse> {
    console.log("📥 [LANCAMENTO-CONTABIL-SERVICE] Obtendo URL download:", lancamentoId);
    const response = await api.get<any>(
      `${this.baseUrl}/${lancamentoId}/notas-fiscais/download`
    );

    console.log("📥 [LANCAMENTO-CONTABIL-SERVICE] Response download:", response.data);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Valida arquivo antes do upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Valida tipo
    if (file.type !== "application/pdf") {
      return { valid: false, error: "Apenas arquivos PDF são permitidos" };
    }

    // Valida tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "O arquivo deve ter no máximo 10MB" };
    }

    return { valid: true };
  }
}

const lancamentoContabilService = new LancamentoContabilService();
export default lancamentoContabilService;
