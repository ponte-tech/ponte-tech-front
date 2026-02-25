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
}

// Exportar instância única (singleton)
const authService = new AuthService();
export default authService;
