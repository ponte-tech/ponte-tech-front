import api from "./api";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  SelectProfileRequest,
  SelectProfileResponse,
  RegisterVendedorRequest,
  RegisterProfessorRequest,
  RegisterResponse,
} from "../types/api";
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
  async selectProfile(perfil: string): Promise<SelectProfileResponse> {
    const payload: SelectProfileRequest = { perfil: perfil as any };

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
  async registerVendedor(data: RegisterVendedorRequest): Promise<RegisterResponse> {
    const response: AxiosResponse<ApiResponse<RegisterResponse>> = await api.post(
      "/api/auth/register/vendedor",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao cadastrar vendedor");
    }

    return response.data.data;
  }

  /**
   * Cadastra novo professor
   */
  async registerProfessor(data: RegisterProfessorRequest): Promise<RegisterResponse> {
    const response: AxiosResponse<ApiResponse<RegisterResponse>> = await api.post(
      "/api/auth/register/professor",
      data
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao cadastrar professor");
    }

    return response.data.data;
  }

  /**
   * Valida se o token ainda é válido
   */
  async validateToken(): Promise<boolean> {
    try {
      // Você pode criar um endpoint de validação no backend
      // Por enquanto, apenas verificamos se o token existe
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Altera a senha do usuário autenticado
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.post(
      "/api/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao alterar senha");
    }
  }

  /**
   * Reseta a senha do usuário (sem autenticação)
   */
  async forgotPassword(email: string, newPassword: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.post(
      "/api/auth/forgot-password",
      {
        email,
        newPassword,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao resetar senha");
    }
  }

  /**
   * Solicita código de recuperação via WhatsApp
   */
  async requestResetCode(email: string): Promise<{ message: string; phoneLastFour: string }> {
    const response: AxiosResponse<ApiResponse<{ message: string; phoneLastFour: string }>> = await api.post(
      "/api/auth/forgot-password/request-code",
      { email }
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || "Erro ao solicitar código");
    }

    return response.data.data;
  }

  /**
   * Verifica código e reseta a senha
   */
  async verifyAndReset(email: string, code: string, newPassword: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await api.post(
      "/api/auth/forgot-password/verify-and-reset",
      {
        email,
        code,
        newPassword,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Erro ao verificar código e resetar senha");
    }
  }
}

// Exportar instância única (singleton)
const authService = new AuthService();
export default authService;
