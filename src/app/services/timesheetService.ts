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
export const getMesCalendario = async (mes: string): Promise<MesResponse> => {
  const response = await api.get<ApiResponse<MesResponse>>(`${BASE_URL}/timesheet/mes`, {
    params: { mes },
  });
  return response.data.data!;
};

export const getResumoMes = async (mes: string): Promise<ResumoMesResponse> => {
  const response = await api.get<ApiResponse<ResumoMesResponse>>(`${BASE_URL}/timesheet/resumo`, {
    params: { mes },
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
export const aprovarMes = async (colaboradorId: string, mes: string): Promise<void> => {
  await api.post(`/api/admin/timesheet/${colaboradorId}/mes/${mes}/aprovar`);
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

const timesheetServiceExport = {
  getContratos,
  getMesCalendario,
  getResumoMes,
  createLancamentos,
  getLancamento,
  updateLancamento,
  deleteLancamento,
  submeterLancamento,
  enviarMesParaAprovacao,
  aprovarMes,
  reprovarMes,
  listarColaboradoresTimesheet,
  getResumoColaborador,
};

export default timesheetServiceExport;
