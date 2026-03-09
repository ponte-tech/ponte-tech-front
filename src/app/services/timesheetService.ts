import api from './api';
import type {
  Contrato,
  MesResponse,
  ResumoMesResponse,
  CreateLancamentoRequest,
  Apontamento,
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

const timesheetServiceExport = {
  getContratos,
  getMesCalendario,
  getResumoMes,
  createLancamentos,
  getLancamento,
  updateLancamento,
  deleteLancamento,
  submeterLancamento,
};

export default timesheetServiceExport;
