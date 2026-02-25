import api from "./api";
import {
  ApiResponse,
  Curso,
  ListCursosResponse,
  CreateCursoRequest,
  UpdateCursoRequest,
  CursoStatus,
  CursoNivel,
} from "../types/api";
import { AxiosResponse } from "axios";

interface ListCursosFilters {
  status?: CursoStatus;
  categoria?: string;
  nivel?: CursoNivel;
  page?: number;
  limit?: number;
}

class CursosService {
  /**
   * Lista todos os cursos (público)
   */
  async list(filters?: ListCursosFilters): Promise<ListCursosResponse> {
    const response: AxiosResponse<ApiResponse<ListCursosResponse>> = await api.get(
      "/api/cursos",
      { params: filters }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar cursos");
    }

    return response.data.data;
  }

  /**
   * Obtém detalhes de um curso específico (público)
   */
  async getById(id: string): Promise<Curso> {
    const response: AxiosResponse<ApiResponse<Curso>> = await api.get(
      `/api/cursos/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao obter curso");
    }

    return response.data.data;
  }

  /**
   * Cria um novo curso (admin apenas)
   */
  async create(data: CreateCursoRequest): Promise<Curso> {
    const response: AxiosResponse<ApiResponse<Curso>> = await api.post(
      "/api/admin/cursos",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar curso");
    }

    return response.data.data;
  }

  /**
   * Atualiza um curso existente (admin apenas)
   */
  async update(id: string, data: UpdateCursoRequest): Promise<Curso> {
    const response: AxiosResponse<ApiResponse<Curso>> = await api.put(
      `/api/admin/cursos/${id}`,
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao atualizar curso");
    }

    return response.data.data;
  }

  /**
   * Lista cursos disponíveis para venda (vendedor apenas)
   */
  async listForVendedor(): Promise<ListCursosResponse> {
    const response: AxiosResponse<ApiResponse<ListCursosResponse>> = await api.get(
      "/api/vendedor/cursos"
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao listar cursos para vendedor");
    }

    return response.data.data;
  }

  /**
   * Exclui um curso (admin apenas)
   */
  async delete(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `/api/admin/cursos/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao excluir curso");
    }
  }
}

// Exportar instância única (singleton)
const cursosService = new CursosService();
export default cursosService;
