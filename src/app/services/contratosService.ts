import api from "./api";
import type {
  Contrato,
  CreateContratoRequest,
  UpdateContratoRequest,
  ListContratosResponse,
} from "../types/api";

class ContratosService {
  private baseUrl = "/api/admin/colaboradores";

  /**
   * Lista todos os contratos de um colaborador
   * - Admins acessam via /api/admin/colaboradores/{userId}/contratos
   * - Colaboradores acessam via /api/colaborador/contratos (próprios contratos)
   */
  async list(userId: string, isColaborador: boolean = false): Promise<ListContratosResponse> {
    const endpoint = isColaborador
      ? `/api/colaborador/contratos`
      : `/api/admin/colaboradores/${userId}/contratos`;

    const response = await api.get<ListContratosResponse>(endpoint);
    return response.data;
  }

  /**
   * Obtém todos os contratos de um usuário (retorna array)
   */
  async getByUserId(userId: string, isColaborador: boolean = false): Promise<Contrato[]> {
    const response = await this.list(userId, isColaborador);

    // A API retorna {success: true, data: {contratos: [...]}} para admin
    // ou {success: true, data: [...]} para colaborador
    const data = (response as any).data || response;

    // Se data é um array, retorna diretamente
    if (Array.isArray(data)) {
      return data;
    }

    // Se data tem a propriedade contratos, retorna ela
    return data.contratos || [];
  }

  /**
   * Cria um novo contrato para um colaborador
   */
  async create(
    userId: string,
    data: CreateContratoRequest
  ): Promise<Contrato> {

    const response = await api.post<Contrato>(
      `${this.baseUrl}/${userId}/contratos`,
      data
    );

    return response.data;
  }

  /**
   * Atualiza um contrato existente
   */
  async update(
    userId: string,
    contratoId: string,
    data: UpdateContratoRequest
  ): Promise<Contrato> {
    const response = await api.put<Contrato>(
      `${this.baseUrl}/${userId}/contratos/${contratoId}`,
      data
    );
    return response.data;
  }

  /**
   * Ativa um contrato (desativa todos os outros)
   */
  async activate(userId: string, contratoId: string): Promise<Contrato> {
    const response = await api.post<Contrato>(
      `${this.baseUrl}/${userId}/contratos/${contratoId}/activate`
    );
    return response.data;
  }

  /**
   * Deleta um contrato
   */
  async delete(userId: string, contratoId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${userId}/contratos/${contratoId}`);
  }
}

const contratosService = new ContratosService();
export default contratosService;
