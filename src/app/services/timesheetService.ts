import api from './api';
import type {
  Contrato,
  MesResponse,
  ResumoMesResponse,
  CreateLancamentoRequest,
  Apontamento,
  ListaTimesheetAprovacaoResponse,
} from '../types/timesheet';
import type { ApiResponse } from '../types/api';

const BASE_URL = '/api/colaborador';

/**
 * Serviço de Timesheet
 * Gerencia lançamento de horas, calendário e totalizadores
 */

// Contratos
export const getContratos = async (): Promise<Contrato[]> => {
  const response = await api.get<ApiResponse<Contrato[]>>(`${BASE_URL}/contratos/`);
  return response.data.data || [];
};

// Calendário e Lançamentos
export const getMesCalendario = async (mes: string, skipCache = false): Promise<MesResponse> => {
  const params: any = { mes };
  if (skipCache) {
    params._t = Date.now(); // Timestamp para bypass de cache
  }

  const response = await api.get<ApiResponse<MesResponse>>(`${BASE_URL}/timesheet/mes`, {
    params
  });
  return response.data.data!;
};

export const getResumoMes = async (mes: string, skipCache = false): Promise<ResumoMesResponse> => {
  const params: any = { mes };
  if (skipCache) {
    params._t = Date.now(); // Timestamp para bypass de cache
  }

  const response = await api.get<ApiResponse<ResumoMesResponse>>(`${BASE_URL}/timesheet/resumo`, {
    params
  });
  return response.data.data!;
};

export const createLancamentos = async (request: CreateLancamentoRequest): Promise<Apontamento[]> => {
  const response = await api.post<ApiResponse<Apontamento[]>>(
    `${BASE_URL}/timesheet/lancamentos`,
    request
  );
  return response.data.data || [];
};

export const getLancamento = async (id: string): Promise<Apontamento> => {
  const response = await api.get<ApiResponse<Apontamento>>(
    `${BASE_URL}/timesheet/lancamentos/${id}`
  );
  return response.data.data!;
};

export const updateLancamento = async (id: string, data: Partial<Apontamento>): Promise<Apontamento> => {
  const response = await api.put<ApiResponse<Apontamento>>(
    `${BASE_URL}/timesheet/lancamentos/${id}`,
    data
  );
  return response.data.data!;
};

export const deleteLancamento = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}/timesheet/lancamentos/${id}`);
};

export const deleteAllLancamentosMes = async (): Promise<void> => {
  await api.delete(`${BASE_URL}/timesheet/mes/lancamentos`);
};

export const submeterLancamento = async (id: string): Promise<Apontamento> => {
  const response = await api.post<ApiResponse<Apontamento>>(
    `${BASE_URL}/timesheet/lancamentos/${id}/submeter`
  );
  return response.data.data!;
};

// Enviar mês para aprovação
export const enviarMesParaAprovacao = async (mes: string): Promise<ResumoMesResponse> => {
  const response = await api.post<ApiResponse<ResumoMesResponse>>(
    `${BASE_URL}/timesheet/mes/${mes}/enviar`
  );
  return response.data.data!;
};

// Admin - Aprovar mês de um colaborador
export const aprovarMes = async (colaboradorId: string, mes: string, valorAprovado?: number): Promise<void> => {
  const body: any = {};
  if (valorAprovado !== undefined) {
    body.valor_aprovado = valorAprovado;
  }

  await api.post(`/api/admin/timesheet/${colaboradorId}/mes/${mes}/aprovar`,
    Object.keys(body).length > 0 ? body : undefined
  );
};

// Admin - Reprovar mês de um colaborador
export const reprovarMes = async (colaboradorId: string, mes: string, motivo: string): Promise<void> => {
  await api.post(`/api/admin/timesheet/${colaboradorId}/mes/${mes}/reprovar`, { motivo });
};

// Admin - Listar todos os colaboradores com status de timesheet para um mês
export const listarColaboradoresTimesheet = async (mes: string): Promise<ListaTimesheetAprovacaoResponse> => {
  const response = await api.get<ApiResponse<ListaTimesheetAprovacaoResponse>>(
    `/api/admin/timesheet/mes/${mes}`
  );
  return response.data.data!;
};

// Admin - Obter resumo detalhado de um colaborador para um mês
export const getResumoColaborador = async (colaboradorId: string, mes: string): Promise<ResumoMesResponse> => {
  const response = await api.get<ApiResponse<ResumoMesResponse>>(
    `/api/admin/timesheet/${colaboradorId}/mes/${mes}`
  );
  return response.data.data!;
};

// Admin - Obter calendário completo de um colaborador para um mês
export const getMesColaborador = async (colaboradorId: string, mes: string, skipCache = false): Promise<MesResponse> => {
  const params: any = {};
  if (skipCache) {
    params._t = Date.now(); // Timestamp para bypass de cache
  }

  const response = await api.get<ApiResponse<MesResponse>>(
    `/api/admin/timesheet/${colaboradorId}/mes/${mes}/calendario`,
    { params }
  );
  return response.data.data!;
};

const timesheetServiceExport = {
  getContratos,
  getMesCalendario,
  getResumoMes,
  createLancamentos,
  getLancamento,
  updateLancamento,
  deleteLancamento,
  deleteAllLancamentosMes,
  submeterLancamento,
  enviarMesParaAprovacao,
  aprovarMes,
  reprovarMes,
  listarColaboradoresTimesheet,
  getResumoColaborador,
  getMesColaborador,
};

export default timesheetServiceExport;
