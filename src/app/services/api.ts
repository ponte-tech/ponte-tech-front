import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, deleteCookie } from "@/app/lib/cookies";

// Base URL da API
// Se NEXT_PUBLIC_API_URL estiver definida, usa ela
// Caso contrário, usa URL relativa para proxy do Next.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Criar instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição - adiciona token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie("token");

    console.log('🔑 [API] Token from cookie:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('🌐 [API] Request:', config.method?.toUpperCase(), config.url);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [API] Authorization header added');
    } else {
      console.warn('⚠️ [API] No token found - request will be unauthorized');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata erros globalmente
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data as any;

      // Token expirado ou inválido
      if (status === 401) {
        deleteCookie("token");
        localStorage.removeItem("user");

        // Redirecionar para login apenas se não estiver em rota pública
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      // Erro de permissão
      if (status === 403) {
        console.error("Acesso negado: Você não tem permissão para acessar este recurso");
      }

      // Erro do servidor
      if (status >= 500) {
        console.error("Erro no servidor. Por favor, tente novamente mais tarde.");
      }
    } else if (error.request) {
      // Requisição feita mas sem resposta
      console.error("Erro de rede: Não foi possível conectar ao servidor");
    }

    return Promise.reject(error);
  }
);

export default api;
