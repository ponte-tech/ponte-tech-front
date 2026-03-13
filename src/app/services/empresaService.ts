import api from "./api";
import type {
  Empresa,
  CreateEmpresaRequest,
  UpdateEmpresaRequest,
  ListEmpresasResponse,
} from "../types/empresa";

class EmpresaService {
  private baseUrl = "/api/admin/empresas";

  /**
   * Lista todas as empresas
   */
  async list(): Promise<ListEmpresasResponse> {
    const response = await api.get<any>(this.baseUrl);

    // A API retorna {"success":true,"data":{"empresas":[...]}}
    // Mas o frontend espera {"empresas":[...]}
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Busca uma empresa por ID
   */
  async getById(empresaId: string): Promise<Empresa> {
    const response = await api.get<any>(`${this.baseUrl}/${empresaId}`);

    // A API retorna {"success":true,"data":{empresa object}}
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }

    return response.data;
  }

  /**
   * Cria uma nova empresa
   */
  async create(data: CreateEmpresaRequest): Promise<Empresa> {
    const response = await api.post<Empresa>(this.baseUrl, data);
    return response.data;
  }

  /**
   * Atualiza uma empresa existente
   */
  async update(empresaId: string, data: UpdateEmpresaRequest): Promise<Empresa> {
    const response = await api.put<Empresa>(
      `${this.baseUrl}/${empresaId}`,
      data
    );
    return response.data;
  }

  /**
   * Deleta uma empresa
   */
  async delete(empresaId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${empresaId}`);
  }
}

const empresaService = new EmpresaService();
export default empresaService;
