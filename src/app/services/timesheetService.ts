import api from "./api";
import {
  ApiResponse,
  ApontamentoResponse,
  MesResponse,
  CreateApontamentoRequest,
  UpdateApontamentoRequest,
  FeriadoResponse,
  CreateFeriadoRequest,
  UpdateFeriadoRequest,
  AtualizarStatusFechamentoRequest,
  FechamentoListItem,
  TimesheetConfigRequest,
  TimesheetConfigResponse,
  AuditoriaFechamentoItem,
} from "../types/api";
import { AxiosResponse } from "axios";

interface ListFechamentosFilters {
  status?: string;
  ano_mes?: string;
}

class TimesheetService {
  // ===== COLABORADOR =====

  async createLancamento(data: CreateApontamentoRequest): Promise<ApontamentoResponse> {
    const response: AxiosResponse<ApiResponse<ApontamentoResponse>> = await api.post(
      "/api/colaborador/timesheet/lancamentos",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar lançamento");
    }

    return response.data.data;
  }

  async getMes(anoMes: string): Promise<MesResponse> {
    const response: AxiosResponse<ApiResponse<MesResponse>> = await api.get(
      "/api/colaborador/timesheet/mes",
      { params: { ano_mes: anoMes } }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao carregar dados do mês");
    }

    return response.data.data;
  }

  async getLancamento(id: string): Promise<ApontamentoResponse> {
    const response: AxiosResponse<ApiResponse<ApontamentoResponse>> = await api.get(
      `/api/colaborador/timesheet/lancamentos/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao obter lançamento");
    }

    return response.data.data;
  }

  async updateLancamento(id: string, data: UpdateApontamentoRequest): Promise<ApontamentoResponse> {
    const response: AxiosResponse<ApiResponse<ApontamentoResponse>> = await api.put(
      `/api/colaborador/timesheet/lancamentos/${id}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao atualizar lançamento");
    }

    return response.data.data;
  }

  async deleteLancamento(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/api/colaborador/timesheet/lancamentos/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao excluir lançamento");
    }
  }

  async submitLancamento(id: string): Promise<ApontamentoResponse> {
    const response: AxiosResponse<ApiResponse<ApontamentoResponse>> = await api.post(
      `/api/colaborador/timesheet/lancamentos/${id}/submeter`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao submeter lançamento");
    }

    return response.data.data;
  }

  async getFeriados(): Promise<FeriadoResponse[]> {
    const response: AxiosResponse<ApiResponse<{ feriados: FeriadoResponse[] }>> = await api.get(
      "/api/colaborador/timesheet/feriados"
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao carregar feriados");
    }

    return response.data.data.feriados;
  }

  async getAuditoriaFechamento(): Promise<AuditoriaFechamentoItem[]> {
    const response: AxiosResponse<ApiResponse<{ auditoria: AuditoriaFechamentoItem[] }>> =
      await api.get("/api/colaborador/timesheet/auditoria-fechamento");

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao carregar auditoria");
    }

    return response.data.data.auditoria;
  }

  // ===== ADMIN =====

  async adminUpdateFechamentoStatus(data: AtualizarStatusFechamentoRequest): Promise<void> {
    const response: AxiosResponse<ApiResponse<unknown>> = await api.put(
      "/api/admin/timesheet/fechamentos/status",
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao atualizar status do fechamento");
    }
  }

  async adminListFechamentos(
    filters?: ListFechamentosFilters
  ): Promise<{ total: number; items: FechamentoListItem[] }> {
    const response: AxiosResponse<
      ApiResponse<{ total: number; items: FechamentoListItem[] }>
    > = await api.get("/api/admin/timesheet/fechamentos", { params: filters });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar fechamentos");
    }

    return response.data.data;
  }

  async adminUpsertConfig(data: TimesheetConfigRequest): Promise<TimesheetConfigResponse> {
    const response: AxiosResponse<ApiResponse<TimesheetConfigResponse>> = await api.post(
      "/api/admin/timesheet/configuracao",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao salvar configuração");
    }

    return response.data.data;
  }

  async adminGetConfig(): Promise<TimesheetConfigResponse> {
    const response: AxiosResponse<ApiResponse<TimesheetConfigResponse>> = await api.get(
      "/api/admin/timesheet/configuracao"
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao carregar configuração");
    }

    return response.data.data;
  }

  async adminCreateFeriado(data: CreateFeriadoRequest): Promise<FeriadoResponse> {
    const response: AxiosResponse<ApiResponse<FeriadoResponse>> = await api.post(
      "/api/admin/timesheet/feriados",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar feriado");
    }

    return response.data.data;
  }

  async adminUpdateFeriado(dataFeriado: string, data: UpdateFeriadoRequest): Promise<FeriadoResponse> {
    const response: AxiosResponse<ApiResponse<FeriadoResponse>> = await api.put(
      `/api/admin/timesheet/feriados/${dataFeriado}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao atualizar feriado");
    }

    return response.data.data;
  }

  async adminDeleteFeriado(dataFeriado: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/api/admin/timesheet/feriados/${dataFeriado}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao excluir feriado");
    }
  }
}

const timesheetService = new TimesheetService();
export default timesheetService;
