# Arquitetura do Projeto Ponte Tech

## Estrutura de Diretórios

O projeto foi organizado usando **Route Groups** do Next.js App Router para separar as diferentes áreas da aplicação:

```
src/app/
├── (public)/                 # Área pública (landing page)
│   ├── layout.tsx           # Layout com Header, Footer e WhatsApp button
│   ├── page.tsx             # Página inicial (/)
│   └── components/          # Componentes da área pública
│       ├── header/
│       ├── footer/
│       ├── home/
│       ├── about/
│       ├── metodology/
│       ├── outsourcing/
│       ├── hunting/
│       ├── vacancies/
│       ├── client-opinion/
│       ├── contact/
│       ├── buttons/
│       ├── cards/
│       ├── carousel/
│       └── social-icons/
│
├── (auth)/                  # Área de autenticação
│   ├── layout.tsx          # Layout simples para auth
│   ├── login/
│   │   └── page.tsx        # Página de login (/login)
│   ├── register/
│   │   └── page.tsx        # Página de registro (/register)
│   └── forgot-password/
│       └── page.tsx        # Página de recuperação (/forgot-password)
│
├── (dashboard)/             # Área logada (protegida)
│   └── dashboard/
│       ├── layout.tsx      # Layout com Sidebar e Navbar
│       ├── page.tsx        # Dashboard principal (/dashboard)
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   └── Navbar.tsx
│       ├── profile/
│       │   └── page.tsx    # Perfil do usuário (/dashboard/profile)
│       └── settings/
│           └── page.tsx    # Configurações (/dashboard/settings)
│
├── contexts/                # Contextos React
│   └── AuthContext.tsx     # Gerenciamento de autenticação
│
├── hooks/                   # Custom hooks
│   └── useAuth.ts          # Hook de autenticação
│
├── lib/                     # Utilitários
│   └── cookies.ts          # Funções para gerenciar cookies
│
├── theme/                   # Tema MUI
│   └── theme.ts
│
├── utils/                   # Utilitários globais
│   ├── FaviconSwitcher.tsx
│   ├── backend-paths.ts
│   ├── format-utils.ts
│   └── scrollToElement.ts
│
├── layout.tsx              # Root layout (global)
├── providers.tsx           # Providers (Theme + Auth)
└── globals.css            # Estilos globais

middleware.ts               # Proteção de rotas
```

## Route Groups

Os **Route Groups** são indicados pelos parênteses `(nome)` e **não afetam a URL**. Eles servem apenas para organização e permitem layouts específicos:

- `(public)` → Rotas acessíveis sem login (/, /about, etc)
- `(auth)` → Rotas de autenticação (/login, /register, /forgot-password)
- `(dashboard)` → Rotas protegidas que requerem autenticação (/dashboard/*)

## Sistema de Autenticação

### AuthContext (`src/app/contexts/AuthContext.tsx`)

Gerencia o estado de autenticação da aplicação:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}
```

### Hook useAuth (`src/app/hooks/useAuth.ts`)

```typescript
import { useAuth } from "@/app/hooks/useAuth";

const { user, isAuthenticated, login, logout } = useAuth();
```

### Armazenamento

- **localStorage**: Armazena dados do usuário
- **Cookies**: Armazena token JWT (usado pelo middleware)

## Middleware de Proteção

O arquivo `src/middleware.ts` protege as rotas privadas:

```typescript
- Se usuário NÃO autenticado tenta acessar /dashboard/* → redireciona para /login
- Se usuário autenticado tenta acessar /login ou /register → redireciona para /dashboard
- Rotas públicas (/, /about, etc) → acessíveis para todos
```

## Layouts

### Root Layout (`src/app/layout.tsx`)
- Layout global com metadata, GTM, providers

### Public Layout (`src/app/(public)/layout.tsx`)
- Header de navegação
- WhatsApp floating button
- Footer
- Background #F9F5FF

### Auth Layout (`src/app/(auth)/layout.tsx`)
- Layout minimalista
- Background #f5f5f5
- Sem header/footer

### Dashboard Layout (`src/app/(dashboard)/dashboard/layout.tsx`)
- Sidebar com navegação
- Navbar superior com perfil
- Background #f5f5f5

## Rotas Disponíveis

### Públicas
- `/` - Landing page
- `/login` - Login
- `/register` - Cadastro
- `/forgot-password` - Recuperação de senha

### Protegidas (requer autenticação)
- `/dashboard` - Dashboard principal
- `/dashboard/profile` - Perfil do usuário
- `/dashboard/settings` - Configurações

## Como Usar

### Adicionar Nova Página Pública

1. Criar arquivo em `src/app/(public)/nome-pagina/page.tsx`
2. A página automaticamente herda o layout público (Header + Footer)
3. Rota será: `/nome-pagina`

### Adicionar Nova Página no Dashboard

1. Criar arquivo em `src/app/(dashboard)/dashboard/nome-pagina/page.tsx`
2. A página automaticamente herda o layout do dashboard (Sidebar + Navbar)
3. Rota será: `/dashboard/nome-pagina`
4. Adicionar link no Sidebar (`src/app/(dashboard)/dashboard/components/Sidebar.tsx`)

### Proteger uma Rota

As rotas dentro de `/dashboard/*` são automaticamente protegidas pelo middleware.

Para proteger outras rotas, edite `src/middleware.ts`:

```typescript
if (pathname.startsWith("/minha-rota-protegida") && !token) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

## Integração com Backend

Atualmente o sistema usa autenticação simulada (mock). Para integrar com backend real:

1. Editar `src/app/contexts/AuthContext.tsx`
2. Descomentar e configurar as chamadas de API:

```typescript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
```

3. Configurar variáveis de ambiente em `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.exemplo.com
```

## Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento (http://localhost:3000)
npm run build    # Build de produção
npm start        # Inicia servidor de produção
npm run lint     # Linting
```

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **Material-UI (MUI) v6** - Componentes UI
- **TypeScript** - Tipagem estática
- **Emotion** - CSS-in-JS
- **Axios** - HTTP client
- **React Hook Form** - Gerenciamento de formulários
- **Joi/Zod** - Validação de schemas

## Próximos Passos

1. ✅ Estrutura de Route Groups
2. ✅ Sistema de autenticação (mock)
3. ✅ Middleware de proteção
4. ✅ Layouts específicos por área
5. ✅ Páginas de dashboard
6. ⏳ Integração com backend real
7. ⏳ Testes unitários e E2E
8. ⏳ Deploy em produção

## Observações Importantes

- Route Groups `(nome)` não aparecem na URL
- Arquivos `layout.tsx` dentro de Route Groups criam layouts específicos
- Middleware roda no servidor e valida cookies
- AuthContext roda no cliente e gerencia estado
- Todas as páginas de dashboard são Client Components ("use client")
