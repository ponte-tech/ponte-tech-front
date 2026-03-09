import api from "./api";
import {
  ApiResponse,
  LancamentoHoras,
  LancamentoHorasListItem,
  ListLancamentosResponse,
  CreateLancamentoRequest,
  CreateMultipleLancamentosRequest,
  UpdateLancamentoRequest,
  ResumoHorasMes,
  StatusLancamento,
  TipoLancamento,
} from "../types/api";
import { AxiosResponse } from "axios";

interface ListLancamentosFilters {
  mes?: number;
  ano?: number;
  status?: StatusLancamento;
  tipo?: TipoLancamento;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

class LancamentoHorasService {
  /**
   * Lista todos os lançamentos de horas do colaborador logado
   */
  async list(filters?: ListLancamentosFilters): Promise<ListLancamentosResponse> {
    const response: AxiosResponse<ApiResponse<ListLancamentosResponse>> = await api.get(
      "/api/colaborador/lancamentos",
      { params: filters }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar lançamentos");
    }

    return response.data.data;
  }

  /**
   * Obtém detalhes de um lançamento específico
   */
  async getById(id: string): Promise<LancamentoHoras> {
    const response: AxiosResponse<ApiResponse<LancamentoHoras>> = await api.get(
      `/api/colaborador/lancamentos/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao obter lançamento");
    }

    return response.data.data;
  }

  /**
   * Cria um novo lançamento de horas
   */
  async create(data: CreateLancamentoRequest): Promise<LancamentoHoras> {
    const response: AxiosResponse<ApiResponse<LancamentoHoras>> = await api.post(
      "/api/colaborador/lancamentos",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar lançamento");
    }

    return response.data.data;
  }

  /**
   * Cria múltiplos lançamentos de horas (para vários dias)
   */
  async createMultiple(data: CreateMultipleLancamentosRequest): Promise<LancamentoHoras[]> {
    const response: AxiosResponse<ApiResponse<LancamentoHoras[]>> = await api.post(
      "/api/colaborador/lancamentos/multiplos",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar lançamentos");
    }

    return response.data.data;
  }

  /**
   * Atualiza um lançamento de horas existente
   */
  async update(id: string, data: UpdateLancamentoRequest): Promise<LancamentoHoras> {
    const response: AxiosResponse<ApiResponse<LancamentoHoras>> = await api.put(
      `/api/colaborador/lancamentos/${id}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao atualizar lançamento");
    }

    return response.data.data;
  }

  /**
   * Exclui um lançamento de horas
   */
  async delete(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/api/colaborador/lancamentos/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao excluir lançamento");
    }
  }

  /**
   * Obtém resumo de horas do mês
   */
  async getResumoMes(mes: number, ano: number): Promise<ResumoHorasMes> {
    const response: AxiosResponse<ApiResponse<ResumoHorasMes>> = await api.get(
      "/api/colaborador/lancamentos/resumo",
      { params: { mes, ano } }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao obter resumo do mês");
    }

    return response.data.data;
  }
}

// Exportar instância única (singleton)
const lancamentoHorasService = new LancamentoHorasService();
export default lancamentoHorasService;
