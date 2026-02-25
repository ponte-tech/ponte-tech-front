import api from "./api";
import {
  ApiResponse,
  MatriculaInfoResponse,
  CreateMatriculaRequest,
  CreateMatriculaResponse,
} from "../types/api";
import { AxiosResponse } from "axios";

class MatriculaService {
  /**
   * Obter informações para página de matrícula
   */
  async getInfo(codigoVendedor: string, codigoCurso: string): Promise<MatriculaInfoResponse> {
    const response: AxiosResponse<ApiResponse<MatriculaInfoResponse>> = await api.get(
      "/api/public/matricula",
      {
        params: {
          codigo_vendedor: codigoVendedor,
          codigo_curso: codigoCurso,
        },
      }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao obter informações de matrícula");
    }

    return response.data.data;
  }

  /**
   * Criar matrícula e iniciar processo de pagamento
   */
  async create(data: CreateMatriculaRequest): Promise<CreateMatriculaResponse> {
    const response: AxiosResponse<ApiResponse<CreateMatriculaResponse>> = await api.post(
      "/api/public/matricula",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao criar matrícula");
    }

    return response.data.data;
  }
}

// Exportar instância única (singleton)
const matriculaService = new MatriculaService();
export default matriculaService;
