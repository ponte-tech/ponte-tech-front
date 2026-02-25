"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "@/app/lib/cookies";
import authService from "@/app/services/authService";
import { User as ApiUser, UserProfile } from "@/app/types/api";

type UserType = "aluno" | "vendedor" | "professor" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  role?: string;
  perfis?: UserProfile[]; // Para suportar múltiplos perfis
  codigoVendedor?: string; // Apenas para vendedores
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  selectProfile: (perfil: UserProfile) => Promise<void>;
  register: (name: string, email: string, password: string, userType: UserType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há usuário logado no localStorage e cookies
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = getCookie("token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Chamar API de login
      const response = await authService.login(email, password);

      // Transformar resposta da API para o formato do User local
      // Se houver múltiplos perfis, usar o primeiro como padrão
      const perfilAtivo = response.user.perfis && response.user.perfis.length > 0
        ? response.user.perfis[0]
        : "aluno";

      const localUser: User = {
        id: response.user.id,
        name: response.user.nome_completo,
        email: response.user.email,
        userType: perfilAtivo as UserType,
        role: perfilAtivo,
        perfis: response.user.perfis,
        codigoVendedor: response.user.codigo_vendedor,
      };

      // Salvar token e usuário
      setCookie("token", response.token, 7); // Cookie válido por 7 dias
      localStorage.setItem("user", JSON.stringify(localUser));
      setUser(localUser);

      // Se usuário tem múltiplos perfis, redirecionar para seleção
      if (response.user.perfis && response.user.perfis.length > 1) {
        router.push("/select-profile");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Erro ao fazer login";
      setError(errorMessage);
      console.error("Erro no login:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProfile = async (perfil: UserProfile) => {
    setIsLoading(true);
    setError(null);

    try {
      // Chamar API de seleção de perfil
      const response = await authService.selectProfile(perfil);

      // Atualizar token e perfil ativo do usuário
      setCookie("token", response.token, 7);

      if (user) {
        const updatedUser = {
          ...user,
          userType: perfil as UserType,
          role: perfil,
          codigoVendedor: response.codigo_vendedor,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Erro ao selecionar perfil";
      setError(errorMessage);
      console.error("Erro ao selecionar perfil:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, userType: UserType) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implementar cadastro completo com todos os campos necessários
      // Por enquanto, manter mock para não quebrar a aplicação
      console.warn("Cadastro ainda não implementado completamente. Use o formulário específico.");

      const mockUser: User = {
        id: "1",
        name: name,
        email: email,
        userType: userType,
        role: userType,
      };

      const mockToken = "mock-jwt-token";

      localStorage.setItem("user", JSON.stringify(mockUser));
      setCookie("token", mockToken, 7);
      setUser(mockUser);

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro no registro:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    deleteCookie("token");
    setUser(null);
    setError(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        selectProfile,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
