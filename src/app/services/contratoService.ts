import api from "./api";
import type {
  Contrato,
  CreateContratoRequest,
  UpdateContratoRequest,
  ListContratosResponse,
  ChangeStatusRequest,
  StatusContrato,
} from "../types/contrato";

class ContratoService {
  private baseUrl = "/api/admin/contratos";

  /**
   * Lista todos os contratos
   */
  async list(filters?: { status?: StatusContrato; cliente_id?: string }): Promise<ListContratosResponse> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.cliente_id) {
      params.append('cliente_id', filters.cliente_id);
    }

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    const response = await api.get<any>(url);

    // A API retorna {"success":true,"data":{"contratos":[...]}}
    // Mas o frontend espera {"contratos":[...]}
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Cria um novo contrato
   */
  async create(data: CreateContratoRequest): Promise<Contrato> {
    const response = await api.post<Contrato>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Obtém um contrato por ID
   */
  async getById(contratoId: string): Promise<Contrato> {
    const response = await api.get<Contrato>(`${this.baseUrl}/${contratoId}`);
    return response.data;
  }

  /**
   * Atualiza um contrato existente
   */
  async update(contratoId: string, clienteId: string, data: UpdateContratoRequest): Promise<Contrato> {
    const response = await api.put<Contrato>(
      `${this.baseUrl}/${contratoId}?cliente_id=${clienteId}`,
      data
    );
    return response.data;
  }

  /**
   * Deleta um contrato
   */
  async delete(contratoId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${contratoId}`);
  }

  /**
   * Altera o status de um contrato
   */
  async changeStatus(contratoId: string, clienteId: string, status: StatusContrato): Promise<Contrato> {
    const data: ChangeStatusRequest = { status };
    const response = await api.put<Contrato>(
      `${this.baseUrl}/${contratoId}/status?cliente_id=${clienteId}`,
      data
    );
    return response.data;
  }
}

const contratoService = new ContratoService();
export default contratoService;
