import api from "./api";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SelectProfileRequest,
  SelectProfileResponse,
  SignupVendedorRequest,
  SignupProfessorRequest,
  SignupColaboradorRequest,
  SignupContadorRequest,
  VendedorSignupResponse,
  ProfessorSignupResponse,
  ColaboradorSignupResponse,
  ContadorSignupResponse,
  UserProfile,
} from "../types/api";
import { formatCPF, formatCNPJ, formatPhone, formatCEP } from "../utils/formatters";
import { AxiosResponse } from "axios";

class AuthService {
  /**
   * Realiza login do usuário
   */
  async login(email: string, senha: string): Promise<LoginResponse> {
    const payload: LoginRequest = { email, senha };

    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post(
      "/api/auth/login",
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao fazer login");
    }

    return response.data.data;
  }

  /**
   * Seleciona o perfil quando usuário tem múltiplos perfis
   */
  async selectProfile(perfil: UserProfile): Promise<SelectProfileResponse> {
    const payload: SelectProfileRequest = { perfil };

    const response: AxiosResponse<ApiResponse<SelectProfileResponse>> = await api.post(
      "/api/auth/select-profile",
      payload
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao selecionar perfil");
    }

    return response.data.data;
  }

  /**
   * Cadastra novo vendedor
   */
  async registerVendedor(data: SignupVendedorRequest): Promise<VendedorSignupResponse> {
    const formattedData = this.formatVendedorData(data);
    const response: AxiosResponse<ApiResponse<VendedorSignupResponse>> = await api.post(
      "/api/auth/register/vendedor",
      formattedData
    );

    if (!response.data.success || !response.data.data) {
      this.throwValidationError(response.data);
    }

    return response.data.data!;
  }

  /**
   * Cadastra novo professor
   */
  async registerProfessor(data: SignupProfessorRequest): Promise<ProfessorSignupResponse> {
    const formattedData = this.formatProfessorData(data);
    const response: AxiosResponse<ApiResponse<ProfessorSignupResponse>> = await api.post(
      "/api/auth/register/professor",
      formattedData
    );

    if (!response.data.success || !response.data.data) {
      this.throwValidationError(response.data);
    }

    return response.data.data!;
  }

  /**
   * Cadastra novo colaborador (Requer perfil administrador)
   */
  async registerColaborador(data: SignupColaboradorRequest): Promise<ColaboradorSignupResponse> {
    const formattedData = this.formatColaboradorData(data);
    const response: AxiosResponse<ApiResponse<ColaboradorSignupResponse>> = await api.post(
      "/api/auth/register/colaborador",
      formattedData
    );

    if (!response.data.success || !response.data.data) {
      this.throwValidationError(response.data);
    }

    return response.data.data!;
  }

  /**
   * Cadastra novo contador (Requer perfil administrador)
   */
  async registerContador(data: SignupContadorRequest): Promise<ContadorSignupResponse> {
    const formattedData = this.formatContadorData(data);
    const response: AxiosResponse<ApiResponse<ContadorSignupResponse>> = await api.post(
      "/api/auth/register/contador",
      formattedData
    );

    if (!response.data.success || !response.data.data) {
      this.throwValidationError(response.data);
    }

    return response.data.data!;
  }

  /**
   * Valida se o token ainda é válido
   */
  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem("token");
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Converte data de DD/MM/YYYY para YYYY-MM-DD
   */
  private formatDate(date: string): string {
    // Se já está em formato YYYY-MM-DD, retorna como está
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
    // Se está em formato DD/MM/YYYY, converte
    if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = date.split("/");
      return `${ano}-${mes}-${dia}`;
    }
    return date;
  }

  /**
   * Formata dados de colaborador para envio à API
   */
  private formatColaboradorData(data: SignupColaboradorRequest): SignupColaboradorRequest {
    return {
      ...data,
      cpf: formatCPF(data.cpf),
      cnpj: formatCNPJ(data.cnpj),
      celular: formatPhone(data.celular),
      endereco: {
        ...data.endereco,
        cep: data.endereco?.cep ? formatCEP(data.endereco.cep) : "",
      },
      dados_contratuais: {
        ...data.dados_contratuais,
        data_contratacao: data.dados_contratuais?.data_contratacao ? this.formatDate(data.dados_contratuais.data_contratacao) : "",
      } as any,
    };
  }

  /**
   * Formata dados de vendedor para envio à API
   */
  private formatVendedorData(data: SignupVendedorRequest): SignupVendedorRequest {
    return {
      ...data,
      cpf: formatCPF(data.cpf),
      telefone: formatPhone(data.telefone),
      endereco: data.endereco
        ? {
            ...data.endereco,
            cep: formatCEP(data.endereco.cep),
          }
        : undefined,
    };
  }

  /**
   * Formata dados de professor para envio à API
   */
  private formatProfessorData(data: SignupProfessorRequest): SignupProfessorRequest {
    return {
      ...data,
      cpf: formatCPF(data.cpf),
      telefone: formatPhone(data.telefone),
    };
  }

  /**
   * Formata dados de contador para envio à API
   */
  private formatContadorData(data: SignupContadorRequest): SignupContadorRequest {
    return {
      ...data,
      cpf: formatCPF(data.cpf),
      celular: formatPhone(data.celular),
    };
  }

  /**
   * Helper para lançar erros de validação ou genéricos
   */
  private throwValidationError(response: ApiResponse<unknown>): never {
    const validationErrors = response.errors?.errors;

    if (validationErrors) {
      const firstError = Object.entries(validationErrors)[0];
      throw new Error(firstError?.[1]?.[0] || response.message || "Erro de validação");
    }

    throw new Error(response.message || "Erro ao realizar operação");
  }
}

// Exportar instância única (singleton)
const authService = new AuthService();
export default authService;
