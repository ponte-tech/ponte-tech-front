import api from "./api";
import type {
  Cliente,
  CreateClienteRequest,
  UpdateClienteRequest,
  ListClientesResponse,
} from "../types/cliente";

class ClienteService {
  private baseUrl = "/api/admin/clientes";

  /**
   * Lista todos os clientes
   */
  async list(filters?: { status?: string }): Promise<ListClientesResponse> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl;
    const response = await api.get<any>(url);

    // A API retorna {"success":true,"data":{"clientes":[...]}}
    // Mas o frontend espera {"clientes":[...]}
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Cria um novo cliente
   */
  async create(data: CreateClienteRequest): Promise<Cliente> {
    const response = await api.post<Cliente>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Atualiza um cliente existente
   */
  async update(clienteId: string, data: UpdateClienteRequest): Promise<Cliente> {
    const response = await api.put<Cliente>(
      `${this.baseUrl}/${clienteId}`,
      data
    );
    return response.data;
  }

  /**
   * Deleta um cliente
   */
  async delete(clienteId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${clienteId}`);
  }

  /**
   * Reativa um cliente (muda status para "ativo")
   */
  async reactivate(clienteId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${clienteId}/reactivate`);
  }
}

const clienteService = new ClienteService();
export default clienteService;
