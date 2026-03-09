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
    console.log('🔍 [EMPRESA-SERVICE] Fazendo request para:', this.baseUrl);
    const response = await api.get<any>(this.baseUrl);
    console.log('🔍 [EMPRESA-SERVICE] Response completo:', response);
    console.log('🔍 [EMPRESA-SERVICE] Response.data:', response.data);
    console.log('🔍 [EMPRESA-SERVICE] Type of response.data:', typeof response.data);

    // A API retorna {"success":true,"data":{"empresas":[...]}}
    // Mas o frontend espera {"empresas":[...]}
    if (response.data?.success && response.data?.data) {
      console.log('🔍 [EMPRESA-SERVICE] Estrutura com success/data detectada');
      return response.data.data;
    }

    console.log('🔍 [EMPRESA-SERVICE] Retornando response.data diretamente');
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
