import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getCookie, deleteCookie } from "@/app/lib/cookies";
import { jwtDecode } from "jwt-decode";

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

// Função para verificar se o token está expirado
function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;

    // Verificar se o token expira em menos de 1 minuto
    // exp é em segundos, Date.now() é em milissegundos
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    return currentTime >= expirationTime;
  } catch (error) {
    return true; // Se não conseguir decodificar, considerar expirado
  }
}

// Interceptor de requisição - adiciona token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCookie("token");

    if (token) {
      // Verificar se o token está expirado antes de adicionar ao header
      if (isTokenExpired(token)) {
        deleteCookie("token");
        localStorage.removeItem("user");

        // Redirecionar para login
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(new Error("Token expirado"));
      }

      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
