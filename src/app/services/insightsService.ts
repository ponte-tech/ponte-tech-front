import api from "./api";
import type {
  InsightsFilters,
  InsightsData,
  TasksByClient,
  TasksByAnalyst,
  TasksByStatus,
  TimelineData,
  ClientOption,
  AnalystOption,
  BoardOption,
} from "@/app/types/insights";

const buildQueryString = (filters: InsightsFilters): string => {
  const params = new URLSearchParams();

  if (filters.startDate) params.append("start_date", filters.startDate);
  if (filters.endDate) params.append("end_date", filters.endDate);
  if (filters.clientId) params.append("client_id", filters.clientId);
  if (filters.analystId) params.append("analyst_id", filters.analystId);
  if (filters.boardId) params.append("board_id", filters.boardId);

  return params.toString();
};

export const insightsService = {
  async getInsights(filters: InsightsFilters = {}): Promise<InsightsData> {
    const queryString = buildQueryString(filters);
    const url = `/api/kanban/insights?${queryString}`;
    const response = await api.get(url);
    return response.data;
  },

  async getTasksByClient(filters: InsightsFilters = {}): Promise<TasksByClient[]> {
    const queryString = buildQueryString(filters);
    const url = `/api/kanban/insights/by-client?${queryString}`;
    const response = await api.get(url);
    return response.data;
  },

  async getTasksByAnalyst(filters: InsightsFilters = {}): Promise<TasksByAnalyst[]> {
    const queryString = buildQueryString(filters);
    const url = `/api/kanban/insights/by-analyst?${queryString}`;
    const response = await api.get(url);
    return response.data;
  },

  async getTasksByStatus(filters: InsightsFilters = {}): Promise<TasksByStatus[]> {
    const queryString = buildQueryString(filters);
    const url = `/api/kanban/insights/by-status?${queryString}`;
    const response = await api.get(url);
    return response.data;
  },

  async getTimeline(filters: InsightsFilters = {}): Promise<TimelineData[]> {
    const queryString = buildQueryString(filters);
    const url = `/api/kanban/insights/timeline?${queryString}`;
    const response = await api.get(url);
    return response.data;
  },

  async getClients(): Promise<ClientOption[]> {
    try {
      const response = await api.get("/api/admin/clientes");

      // A API retorna {success: true, data: {clientes: [...], total: N}}
      const rawData = response.data?.data || response.data;

      // Extrair array de clientes
      let data = Array.isArray(rawData) ? rawData : [];
      if (!Array.isArray(rawData) && rawData && typeof rawData === 'object') {
        data = rawData.clientes || rawData.data || rawData.items || Object.values(rawData);
      }

      // Filtrar apenas clientes ativos
      const activeClients = data.filter((c: any) => c.status === "ativo" || c.status === "ATIVO");

      return activeClients.map((client: any) => ({
        id: client.cliente_id || client.id,
        name: client.nome_fantasia || client.razao_social || client.nome || client.razaoSocial || client.name || "Cliente sem nome",
      }));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }
  },

  async getAnalysts(): Promise<AnalystOption[]> {
    try {
      console.log("Chamando API /api/admin/colaboradores...");
      const response = await api.get("/api/admin/colaboradores");
      console.log("Resposta da API colaboradores:", response);
      console.log("response.data:", response.data);

      // A API retorna {success: true, data: {...}} similar à de clientes
      const rawData = response.data?.data || response.data;
      console.log("rawData colaboradores:", rawData);
      console.log("rawData é array?", Array.isArray(rawData));
      console.log("Tipo de rawData:", typeof rawData);
      console.log("Propriedades de rawData:", Object.keys(rawData));

      // Se rawData é um objeto com propriedade 'colaboradores', extrair
      let data = Array.isArray(rawData) ? rawData : [];
      if (!Array.isArray(rawData) && rawData && typeof rawData === 'object') {
        // Tentar pegar de várias propriedades possíveis
        data = rawData.colaboradores || rawData.users || rawData.data || rawData.items || Object.values(rawData);
      }
      console.log("Data após extração:", data);
      console.log("Total de colaboradores recebidos:", data.length);

      // Filtrar apenas colaboradores ativos
      const analysts = data.filter((c: any) => c.status === "ativo" || c.status === "ATIVO");
      console.log("Colaboradores ativos filtrados:", analysts.length);

      const mapped = analysts.map((analyst: any) => ({
        id: analyst.user_id || analyst.id,
        name: analyst.nome_completo || analyst.nome || analyst.name || "Analista sem nome",
        foto_perfil_url: analyst.foto_perfil_url,
      }));
      console.log("Colaboradores mapeados:", mapped);
      return mapped;
    } catch (error) {
      console.error("Erro ao buscar analistas:", error);
      return [];
    }
  },

  async getBoards(): Promise<BoardOption[]> {
    try {
      const response = await api.get("/api/kanban/boards");
      const data = Array.isArray(response.data) ? response.data : [];
      return data.map((board: any) => ({
        id: board.board_id,
        name: board.name,
      }));
    } catch (error) {
      return [];
    }
  },
};
