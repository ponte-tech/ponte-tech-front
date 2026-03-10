import api from "./api";
import type {
  Imposto,
  CreateImpostoRequest,
  UpdateImpostoRequest,
  ListImpostosResponse,
} from "../types/imposto";

class ImpostoService {
  private baseUrl = "/api/admin/impostos";

  /**
   * Lista todos os impostos (opcionalmente filtra por mês)
   */
  async list(mesReferencia?: string): Promise<ListImpostosResponse> {
    const url = mesReferencia
      ? `${this.baseUrl}?mes_referencia=${mesReferencia}`
      : this.baseUrl;

    const response = await api.get<any>(url);

    // A API retorna {"success":true,"data":{"impostos":[...]}}
    // Mas o frontend espera {"impostos":[...]}
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Busca um imposto por ID
   */
  async getById(impostoId: string): Promise<Imposto> {
    const response = await api.get<any>(`${this.baseUrl}/${impostoId}`);

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Cria um novo imposto (sem anexos)
   */
  async create(data: Omit<CreateImpostoRequest, 'anexos'>): Promise<Imposto> {
    const response = await api.post<any>(this.baseUrl, {
      empresa_id: data.empresa_id,
      descricao: data.descricao,
      tipo_imposto: data.tipo_imposto,
      mes_referencia: data.mes_referencia,
      valor: data.valor,
    });

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Atualiza um imposto existente com upload de arquivos
   */
  async update(impostoId: string, data: UpdateImpostoRequest): Promise<Imposto> {
    const formData = new FormData();

    // Adiciona os campos do formulário
    formData.append("descricao", data.descricao);
    formData.append("tipo_imposto", data.tipo_imposto);
    formData.append("mes_referencia", data.mes_referencia);
    formData.append("valor", data.valor.toString());

    // Adiciona os arquivos se existirem
    if (data.anexos && data.anexos.length > 0) {
      data.anexos.forEach((file, index) => {
        formData.append(`anexos`, file);
      });
    }

    const response = await api.put<any>(
      `${this.baseUrl}/${impostoId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Deleta um imposto
   */
  async delete(impostoId: string, empresaId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${impostoId}`, {
      params: { empresa_id: empresaId },
    });
  }

  /**
   * Inicia o upload de um anexo para o S3
   * Retorna presigned URL para upload direto
   */
  async initiateAnexoUpload(
    impostoId: string,
    fileName: string,
    fileSize: number,
    contentType: string
  ): Promise<{ upload_url: string; s3_key: string }> {
    const response = await api.post<any>(
      `${this.baseUrl}/${impostoId}/anexos/upload/initiate`,
      {
        nome_arquivo: fileName,
        tamanho_bytes: fileSize,
        content_type: contentType,
      }
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Faz upload do arquivo para S3 usando presigned URL
   */
  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
  }

  /**
   * Confirma o upload do anexo no backend
   */
  async confirmAnexoUpload(
    impostoId: string,
    s3Key: string,
    fileName: string,
    fileSize: number,
    contentType: string,
    tipoImposto: string
  ): Promise<void> {
    await api.post<any>(`${this.baseUrl}/${impostoId}/anexos/confirm`, {
      s3_key: s3Key,
      nome_arquivo: fileName,
      tamanho_bytes: fileSize,
      content_type: contentType,
      tipo_imposto: tipoImposto,
    });
  }

  /**
   * Obtém URL de download de um anexo
   */
  async getAnexoDownloadUrl(
    impostoId: string,
    empresaId: string,
    s3Key: string
  ): Promise<{ download_url: string; nome_arquivo: string }> {
    const response = await api.get<any>(
      `${this.baseUrl}/${impostoId}/anexos/download`,
      {
        params: {
          empresa_id: empresaId,
          s3_key: s3Key
        },
      }
    );

    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Deleta um anexo
   */
  async deleteAnexo(impostoId: string, s3Key: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${impostoId}/anexos`, {
      params: { s3_key: s3Key },
    });
  }

  /**
   * Valida arquivo antes do upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Valida tipo
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Tipo de arquivo não permitido" };
    }

    // Valida tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: "O arquivo deve ter no máximo 10MB" };
    }

    return { valid: true };
  }
}

const impostoService = new ImpostoService();
export default impostoService;
