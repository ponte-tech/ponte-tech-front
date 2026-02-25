"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, deleteCookie } from "@/app/lib/cookies";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    try {
      // TODO: Integrar com seu backend
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // Simulação temporária
      const mockUser: User = {
        id: "1",
        name: "Usuário Teste",
        email: email,
        role: "user",
      };

      const mockToken = "mock-jwt-token";

      localStorage.setItem("user", JSON.stringify(mockUser));
      setCookie("token", mockToken, 7); // Cookie válido por 7 dias
      setUser(mockUser);

      router.push("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Integrar com seu backend
      // const response = await fetch("/api/auth/register", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name, email, password }),
      // });
      // const data = await response.json();

      // Simulação temporária
      const mockUser: User = {
        id: "1",
        name: name,
        email: email,
        role: "user",
      };

      const mockToken = "mock-jwt-token";

      localStorage.setItem("user", JSON.stringify(mockUser));
      setCookie("token", mockToken, 7); // Cookie válido por 7 dias
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
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
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
