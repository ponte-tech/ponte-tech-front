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

// Configuração de retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// Função auxiliar para delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Interceptor de resposta - trata erros globalmente com retry
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: number };

    // Verificar se é um erro de rede que pode ser retentado
    const isNetworkError = error.code === 'ERR_NETWORK' ||
                          error.code === 'ECONNABORTED' ||
                          error.code === 'ERR_NETWORK_CHANGED' ||
                          error.message?.includes('Network Error');

    // Inicializar contador de retry
    if (!config._retry) {
      config._retry = 0;
    }

    // Retry para erros de rede ou timeout, mas não para erros 4xx (exceto 429)
    const shouldRetry = (isNetworkError || error.response?.status === 429 || error.response?.status! >= 500)
                       && config._retry < MAX_RETRIES;

    if (shouldRetry && config) {
      config._retry++;
    // console.warn(`Tentativa ${config._retry} de ${MAX_RETRIES} após erro de rede...`);

      // Delay exponencial: 1s, 2s, 4s
      await delay(RETRY_DELAY * Math.pow(2, config._retry - 1));

      return api.request(config);
    }

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
    // console.error("Acesso negado: Você não tem permissão para acessar este recurso");
      }

      // Erro do servidor
      if (status >= 500) {
    // console.error("Erro no servidor. Por favor, tente novamente mais tarde.");
      }
    } else if (error.request) {
      // Requisição feita mas sem resposta (após todas as tentativas)
    // console.error("Erro de rede: Não foi possível conectar ao servidor após múltiplas tentativas");
    }

    return Promise.reject(error);
  }
);

export default api;
