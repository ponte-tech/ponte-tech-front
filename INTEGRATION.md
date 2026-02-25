# Integração Frontend-Backend - Ponte Tech Academy

## 📡 Configuração da API

### URL Base da API

A URL da API está configurada no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod
```

### Estrutura de Serviços

```
src/app/
├── services/
│   ├── api.ts              # Cliente Axios configurado com interceptors
│   └── authService.ts      # Serviço de autenticação
├── types/
│   └── api.ts              # Tipos TypeScript para API
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticação integrado
└── hooks/
    └── useAuth.ts          # Hook para usar autenticação
```

## 🔐 Autenticação

### Como Funciona

1. **Login**: Usuário faz login com email e senha
2. **Token JWT**: Backend retorna um token JWT que é salvo em cookie
3. **Interceptor**: Todas as requisições subsequentes incluem o token automaticamente
4. **Refresh**: Token expira em 7 dias (configurável)

### Fluxo de Login

```typescript
// Página de login usa o hook useAuth
const { login, isLoading, error } = useAuth();

// Ao fazer login
await login(email, password);

// O AuthContext:
// 1. Chama authService.login()
// 2. Salva token em cookie
// 3. Salva user em localStorage
// 4. Redireciona para dashboard ou seleção de perfil
```

### Perfis Suportados

- **admin**: Acesso total ao sistema
- **vendedor**: Acesso a vendas e comissões
- **professor**: Acesso a cursos e aulas
- **aluno**: Acesso a cursos matriculados

### Múltiplos Perfis

Usuários podem ter múltiplos perfis (ex: vendedor + professor):

```typescript
// Quando usuário tem múltiplos perfis, é redirecionado para /select-profile
if (response.user.perfis && response.user.perfis.length > 1) {
  router.push("/select-profile");
}

// Usar selectProfile para escolher o perfil ativo
await selectProfile("vendedor");
```

## 🌐 Cliente API (Axios)

### Configuração (`src/app/services/api.ts`)

```typescript
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Interceptor de Requisição

Adiciona automaticamente o token JWT em todas as requisições:

```typescript
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Interceptor de Resposta

Trata erros globalmente:

- **401 Unauthorized**: Remove token e redireciona para login
- **403 Forbidden**: Loga erro de permissão
- **500+ Server Error**: Loga erro do servidor

## 📝 Tipos TypeScript

### Resposta Padrão da API

```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}
```

### Usuário

```typescript
interface User {
  id: string;
  nome_completo: string;
  email: string;
  perfil: UserProfile;
  perfis?: UserProfile[];
  status: string;
  data_cadastro: string;
}
```

### Login

```typescript
// Request
interface LoginRequest {
  email: string;
  senha: string;
}

// Response
interface LoginResponse {
  user: User;
  token: string;
  expires_in: number;
}
```

## 🔨 Como Usar

### 1. Login

```typescript
"use client";
import { useAuth } from "@/app/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redireciona automaticamente para dashboard
    } catch (err) {
      console.error("Erro ao fazer login:", err);
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

### 2. Acessar Usuário Logado

```typescript
"use client";
import { useAuth } from "@/app/hooks/useAuth";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  if (!isAuthenticated) return <div>Não autenticado</div>;

  return (
    <div>
      <h1>Bem-vindo, {user.name}!</h1>
      <p>Perfil: {user.userType}</p>
    </div>
  );
}
```

### 3. Logout

```typescript
const { logout } = useAuth();

const handleLogout = () => {
  logout(); // Remove token e redireciona para login
};
```

### 4. Fazer Chamadas à API

#### Opção 1: Usar o cliente api diretamente

```typescript
import api from "@/app/services/api";

// GET request
const response = await api.get("/api/cursos");
const cursos = response.data.data;

// POST request
const response = await api.post("/api/admin/cursos", {
  titulo: "Novo Curso",
  descricao: "Descrição do curso",
  // ...
});

// PUT request
await api.put(`/api/admin/cursos/${id}`, updatedData);

// DELETE request
await api.delete(`/api/admin/cursos/${id}`);
```

#### Opção 2: Criar serviços específicos

```typescript
// src/app/services/cursosService.ts
import api from "./api";

class CursosService {
  async list(params?: { categoria?: string; page?: number }) {
    const response = await api.get("/api/cursos", { params });
    return response.data.data;
  }

  async getById(id: string) {
    const response = await api.get(`/api/cursos/${id}`);
    return response.data.data;
  }

  async create(data: CreateCursoRequest) {
    const response = await api.post("/api/admin/cursos", data);
    return response.data.data;
  }
}

export default new CursosService();
```

## 🔒 Proteção de Rotas

### Criar Middleware de Autenticação

Criar arquivo `src/middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
                     request.nextUrl.pathname.startsWith("/register");
  const isProtectedPage = request.nextUrl.pathname.startsWith("/dashboard");

  // Redirecionar para login se tentar acessar página protegida sem token
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirecionar para dashboard se já estiver logado e tentar acessar login
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

## 🧪 Testando a Integração

### 1. Login com Admin

```typescript
// Credenciais de teste
email: "admin@pontetech.com"
senha: "PonteTech2026!"
```

### 2. Verificar no DevTools

```javascript
// Console do navegador
// Verificar token
document.cookie

// Verificar usuário
localStorage.getItem("user")
```

### 3. Testar Requisições Autenticadas

```typescript
// Em qualquer componente autenticado
import api from "@/app/services/api";

const testAPI = async () => {
  try {
    const response = await api.get("/api/admin/dashboard");
    console.log("Dashboard data:", response.data);
  } catch (error) {
    console.error("Erro:", error);
  }
};
```

## 📊 Estrutura de Erros

### Tratamento de Erros

```typescript
try {
  await api.post("/api/cursos", data);
} catch (error) {
  if (error.response) {
    // Erro da API
    const status = error.response.status;
    const message = error.response.data.message;

    if (status === 400) {
      console.error("Validação:", error.response.data.errors);
    } else if (status === 401) {
      console.error("Não autenticado");
    } else if (status === 403) {
      console.error("Sem permissão");
    } else if (status >= 500) {
      console.error("Erro no servidor");
    }
  } else if (error.request) {
    // Sem resposta do servidor
    console.error("Erro de rede");
  }
}
```

## 🚀 Próximas Implementações

### Serviços Adicionais a Criar

1. **cursosService.ts** - Gestão de cursos
2. **matriculaService.ts** - Matrículas
3. **aulasService.ts** - Aulas e conteúdo
4. **financeiroService.ts** - Painel financeiro
5. **adminService.ts** - Dashboard administrativo

### Exemplo de Implementação

```typescript
// src/app/services/cursosService.ts
import api from "./api";
import { Curso, CreateCursoRequest } from "../types/api";

class CursosService {
  async list(filters?: {
    categoria?: string;
    nivel?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/api/cursos", { params: filters });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get(`/api/cursos/${id}`);
    return response.data.data;
  }

  async create(data: CreateCursoRequest) {
    const response = await api.post("/api/admin/cursos", data);
    return response.data.data;
  }

  async update(id: string, data: Partial<CreateCursoRequest>) {
    const response = await api.put(`/api/admin/cursos/${id}`, data);
    return response.data.data;
  }
}

export default new CursosService();
```

## 📚 Documentação Adicional

- **API Gateway**: `ponte-tech-back/DEPLOYMENT.md`
- **Endpoints**: Ver seção "Endpoints Principais" no DEPLOYMENT.md
- **Tipos**: `src/app/types/api.ts`

## 🐛 Troubleshooting

### Erro: "Network Error"
- Verificar se a API está rodando
- Verificar URL em `.env.local`
- Verificar CORS no API Gateway

### Erro: "401 Unauthorized"
- Token expirado ou inválido
- Fazer logout e login novamente
- Verificar se token está sendo enviado (DevTools > Network)

### Erro: "CORS policy"
- API Gateway deve ter CORS configurado
- Verificar headers no interceptor do Axios

### Token não persiste
- Verificar se cookies estão habilitados no navegador
- Verificar domínio do cookie (deve ser compatível)

---

**Última atualização**: 2026-02-25
**Versão**: 1.0.0
