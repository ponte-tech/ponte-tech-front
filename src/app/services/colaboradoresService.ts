import api from "./api";
import {
  ApiResponse,
  Colaborador,
  ColaboradorListItem,
  ListColaboradoresResponse,
  CreateColaboradorRequest,
  UpdateColaboradorRequest,
  ColaboradorStatus,
} from "../types/api";
import { AxiosResponse } from "axios";

interface ListColaboradoresFilters {
  status?: ColaboradorStatus;
  page?: number;
  limit?: number;
}

class ColaboradoresService {
  /**
   * Lista todos os colaboradores (admin apenas)
   */
  async list(filters?: ListColaboradoresFilters): Promise<ListColaboradoresResponse> {
    try {
      const response: AxiosResponse<ApiResponse<ListColaboradoresResponse>> = await api.get(
        "/api/admin/colaboradores",
        { params: filters }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao listar colaboradores");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Obtém detalhes de um colaborador específico
   * - Admins podem acessar qualquer colaborador via /api/admin
   * - Colaboradores acessam apenas seus próprios dados via /api/colaborador
   */
  async getById(id: string, isColaborador: boolean = false): Promise<Colaborador> {
    try {
      // Colaboradores usam endpoint próprio, admins usam endpoint admin
      const endpoint = isColaborador
        ? `/api/colaborador/perfil`
        : `/api/admin/colaboradores/${id}`;

      const response: AxiosResponse<ApiResponse<Colaborador>> = await api.get(endpoint);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao obter colaborador");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Cria um novo colaborador (admin apenas)
   */
  async create(data: CreateColaboradorRequest): Promise<Colaborador> {
    try {
      const response: AxiosResponse<ApiResponse<Colaborador>> = await api.post(
        "/api/auth/register/colaborador",
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao criar colaborador");
      }

      return response.data.data;
    } catch (error: any) {
      // Se for um erro do axios, extrair a mensagem do response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      // Se não, relançar o erro original
      throw error;
    }
  }

  /**
   * Atualiza um colaborador existente
   * - Admins podem atualizar qualquer colaborador via /api/admin
   * - Colaboradores atualizam apenas seus próprios dados via /api/colaborador
   */
  async update(id: string, data: UpdateColaboradorRequest, isColaborador: boolean = false): Promise<Colaborador> {
    try {
      // Colaboradores usam endpoint próprio, admins usam endpoint admin
      const endpoint = isColaborador
        ? `/api/colaborador/perfil`
        : `/api/admin/colaboradores/${id}`;

      const response: AxiosResponse<ApiResponse<Colaborador>> = await api.put(
        endpoint,
        data
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Erro ao atualizar colaborador");
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Exclui um colaborador (admin apenas)
   */
  async delete(id: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await api.delete(
        `/api/admin/colaboradores/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao excluir colaborador");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  /**
   * Reativa um colaborador (muda status para "ativo")
   */
  async reactivate(id: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await api.post(
        `/api/admin/colaboradores/${id}/reactivate`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Erro ao reativar colaborador");
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}

// Exportar instância única (singleton)
const colaboradoresService = new ColaboradoresService();
export default colaboradoresService;
