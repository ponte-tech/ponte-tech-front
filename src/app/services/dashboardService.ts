import api from './api';
import type { DashboardColaboradorResponse, DashboardAdminResponse, FinanceirosPorEmpresaResponse } from '../types/dashboard';

const dashboardService = {
  /**
   * Get dashboard data for colaborador
   * @param mes - Month in format YYYY-MM (optional, defaults to current month)
   */
  async getDashboardColaborador(mes?: string): Promise<DashboardColaboradorResponse> {
    const params = mes ? { mes } : {};
    const response = await api.get<{success: boolean, data: DashboardColaboradorResponse}>('/api/colaborador/timesheet/dashboard', { params });
    return response.data.data; // Extrair o data interno
  },

  /**
   * Get dashboard data for admin
   * @param mes - Month in format YYYY-MM (optional, defaults to current month)
   */
  async getDashboardAdmin(mes?: string): Promise<DashboardAdminResponse> {
    const params = mes ? { mes } : {};
    const response = await api.get<{success: boolean, data: DashboardAdminResponse}>('/api/admin/dashboard-timesheet', { params });
    return response.data.data; // Extrair o data interno
  },

  /**
   * Get financial data by company
   * @param meses - Number of months to fetch (default 6, max 12)
   */
  async getFinanceirosPorEmpresa(meses?: number): Promise<FinanceirosPorEmpresaResponse> {
    const params = meses ? { meses } : {};
    const response = await api.get<{success: boolean, data: FinanceirosPorEmpresaResponse}>('/api/admin/financeiros-por-empresa', { params });
    return response.data.data;
  },
};

export default dashboardService;
