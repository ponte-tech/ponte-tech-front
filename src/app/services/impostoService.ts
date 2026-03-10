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
   * Cria um novo imposto com upload de arquivos
   */
  async create(data: CreateImpostoRequest): Promise<Imposto> {
    const formData = new FormData();

    // Adiciona os campos do formulário
    formData.append("empresa_id", data.empresa_id);
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

    const response = await api.post<any>(this.baseUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
  async delete(impostoId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${impostoId}`);
  }

  /**
   * Download de um anexo
   */
  async downloadAnexo(impostoId: string, anexoUrl: string): Promise<Blob> {
    const response = await api.get<Blob>(
      `${this.baseUrl}/${impostoId}/anexos/${anexoUrl}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}

const impostoService = new ImpostoService();
export default impostoService;
