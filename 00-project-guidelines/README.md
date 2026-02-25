# Guia de Boas Práticas - CRM Frontend (React + TypeScript)

**Data:** 2025-10-27
**Versão:** 1.0

---

## 📚 Documentação Disponível

Esta pasta contém todas as diretrizes e boas práticas para desenvolvimento frontend do CRM.

### **👨‍💻 Para Desenvolvedores**

| Arquivo | Quando Usar |
|---------|-------------|
| **[React-TypeScript-Best-Practices.md](./React-TypeScript-Best-Practices.md)** | 🔴 **SEMPRE** - Padrões React + TS |
| **[Clean-Code-Frontend.md](./Clean-Code-Frontend.md)** | 🔴 **TODA TAREFA** - Princípios de código limpo |
| **[Modern-Page-Design-Pattern.md](./Modern-Page-Design-Pattern.md)** | 🔴 **CRIAR/MODERNIZAR PÁGINAS** - Padrão visual moderno |
| **[Components-Architecture.md](./Components-Architecture.md)** | Criar/refatorar componentes |
| **[State-Management-Guide.md](./State-Management-Guide.md)** | Gerenciar estado da aplicação |
| **[Testing-Guide.md](./Testing-Guide.md)** | Escrever testes |
| **[Table-UX-Practices.md](./Table-UX-Practices.md)** | Implementar tabelas com UX moderna |

### **🤖 Para Modelos de IA**

Se você é uma IA trabalhando neste projeto, **COMECE AQUI:**

1. **Leia primeiro:** React-TypeScript-Best-Practices.md
2. **Sempre consulte:** Clean-Code-Frontend.md
3. **Conforme necessário:** Outros guias específicos

---

## 🚀 Quick Start para Desenvolvimento

### **Ao Receber uma Nova Tarefa:**

```
1️⃣ Ler: React-TypeScript-Best-Practices.md
2️⃣ Ler: Clean-Code-Frontend.md
3️⃣ Consultar guias específicos:
   - Components-Architecture.md (para componentes)
   - State-Management-Guide.md (para estado)
   - Testing-Guide.md (para testes)
4️⃣ Implementar seguindo as regras
5️⃣ Validar com linters e testes
```

---

## 📁 Estrutura de Documentação

```
crm-site/
├── docs/
│   └── 00-project-guidelines/                    ← VOCÊ ESTÁ AQUI
│       ├── README.md                             ← Este arquivo
│       ├── React-TypeScript-Best-Practices.md    ← Padrões React + TS
│       ├── Clean-Code-Frontend.md                ← Código limpo
│       ├── Components-Architecture.md            ← Arquitetura de componentes
│       ├── State-Management-Guide.md             ← Gerenciamento de estado
│       ├── Testing-Guide.md                      ← Guia de testes
│       ├── Table-UX-Practices.md                 ← Práticas de UX para tabelas
│       ├── Modern-Page-Design-Pattern.md         ← Padrão moderno de design de páginas
│       ├── Brand-Colors.md                       ← Cores da marca
│       └── Brand-Typography.md                   ← Tipografia da marca
│
└── src/
    ├── components/      ← Componentes reutilizáveis
    ├── pages/          ← Páginas/Views
    ├── hooks/          ← Custom hooks
    ├── services/       ← API e serviços
    ├── stores/         ← Estado global
    ├── types/          ← Type definitions
    └── utils/          ← Utilitários
```

---

## 🎯 Stack Tecnológico

### **Core:**
- React 18
- TypeScript 5+
- Vite (build tool)

### **Estilização:**
- Tailwind CSS
- CSS Modules (opcional)

### **Estado:**
- Zustand (estado global)
- React Query/TanStack Query (server state)
- Context API (para casos específicos)

### **Formulários:**
- React Hook Form
- Zod (validação)

### **Qualidade:**
- ESLint
- Prettier
- TypeScript strict mode
- Vitest/Jest (testes)
- React Testing Library

---

## ⚠️ REGRAS CRÍTICAS

### **NUNCA:**

```
❌ Usar `any` no TypeScript
❌ Componentes com mais de 250 linhas
❌ Lógica de negócio no componente
❌ Props drilling (mais de 2 níveis)
❌ Mutação direta de estado
❌ Fazer commit sem executar linters
❌ Fazer commit sem testes passando
❌ Deixar console.log no código
❌ Importações absolutas misturadas com relativas
```

### **SEMPRE:**

```
✅ Tipar tudo (props, state, funções)
✅ Usar componentes funcionais + hooks
✅ Separar lógica (custom hooks)
✅ Componentes pequenos e focados
✅ Props interface explícita
✅ Nomes descritivos (sem abreviações)
✅ Executar ESLint + Prettier
✅ Escrever testes para lógica crítica
✅ Documentar componentes complexos
✅ Usar path aliases (@/)
```

---

## 📊 Métricas de Qualidade

| Métrica | Objetivo | Obrigatório |
|---------|----------|-------------|
| **TypeScript Coverage** | 100% | ✅ Sim |
| **ESLint Errors** | 0 | ✅ Sim |
| **Max Component Lines** | ≤ 250 | ✅ Sim |
| **Max Function Lines** | ≤ 50 | ⚠️ Recomendado |
| **Test Coverage** | ≥ 70% | ⚠️ Recomendado |
| **Bundle Size** | Monitorar | ⚠️ Recomendado |

---

## 🔧 Comandos Rápidos

```bash
# Instalar dependências
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Testes
npm run test
npm run test:watch
npm run test:coverage

# Format
npm run format
```

---

## 🎨 Padrões de Código

### **Estrutura de Componente:**

```typescript
// ✅ BOM - Ordem correta
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// Types
interface Props {
  id: string
  onSuccess?: () => void
}

// Component
export function UserProfile({ id, onSuccess }: Props) {
  // 1. Hooks
  const [isOpen, setIsOpen] = useState(false)
  const { data, isLoading } = useQuery(...)

  // 2. Effects
  useEffect(() => {
    // ...
  }, [])

  // 3. Handlers
  const handleSubmit = () => {
    // ...
  }

  // 4. Early returns
  if (isLoading) return <Loading />

  // 5. Render
  return (
    <div>...</div>
  )
}
```

### **Nomenclatura:**

```typescript
// ✅ Componentes: PascalCase
export function UserCard() {}

// ✅ Hooks: camelCase com 'use' prefix
export function useUserData() {}

// ✅ Utils: camelCase
export function formatDate() {}

// ✅ Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = '...'

// ✅ Types/Interfaces: PascalCase
interface User {}
type UserStatus = 'active' | 'inactive'
```

---

## 🏗️ Arquitetura de Pastas

### **Recomendado:**

```
src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Componentes base (Button, Input)
│   ├── forms/              # Componentes de formulário
│   ├── layout/             # Layout components
│   └── shared/             # Componentes compartilhados
│
├── pages/                  # Páginas/Views
│   ├── Home/
│   ├── Dashboard/
│   └── Users/
│
├── features/               # Features por domínio (opcional)
│   ├── auth/
│   ├── users/
│   └── products/
│
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   └── index.ts
│
├── services/               # API e serviços externos
│   ├── api/
│   │   ├── client.ts
│   │   ├── users.ts
│   │   └── auth.ts
│   └── storage/
│
├── stores/                 # Estado global (Zustand)
│   ├── authStore.ts
│   ├── userStore.ts
│   └── index.ts
│
├── types/                  # Type definitions
│   ├── user.ts
│   ├── api.ts
│   └── index.ts
│
├── utils/                  # Funções utilitárias
│   ├── date.ts
│   ├── format.ts
│   └── validation.ts
│
├── styles/                 # Estilos globais
│   ├── globals.css
│   └── tailwind.css
│
└── config/                 # Configurações
    ├── constants.ts
    └── env.ts
```

---

## 📖 Documentos Técnicos

### **Sempre Consultar:**

1. **[React-TypeScript-Best-Practices.md](./React-TypeScript-Best-Practices.md)**
   - Patterns React + TypeScript
   - Hooks, Components, Types
   - Performance e otimização

2. **[Clean-Code-Frontend.md](./Clean-Code-Frontend.md)**
   - Princípios SOLID adaptados
   - DRY, KISS, YAGNI
   - Code smells e refactoring

3. **[Components-Architecture.md](./Components-Architecture.md)**
   - Atomic Design
   - Component composition
   - Props pattern

### **Design & UX:**

4. **[Modern-Page-Design-Pattern.md](./Modern-Page-Design-Pattern.md)** ⭐ **NOVO**
   - Padrão visual moderno para páginas
   - Headers, cards, botões, tabelas
   - Sistema de cores e gradientes
   - Responsividade e acessibilidade

### **Consultar Quando Necessário:**

5. **[State-Management-Guide.md](./State-Management-Guide.md)**
   - Zustand patterns
   - React Query
   - Context API

6. **[Testing-Guide.md](./Testing-Guide.md)**
   - Unit tests
   - Integration tests
   - Testing Library patterns

7. **[Table-UX-Practices.md](./Table-UX-Practices.md)**
   - Layout full-height
   - Score e status badges
   - Dropdown de ações
   - Paginação moderna

---

## 🔍 Checklist de Qualidade

### **Antes de Commitar:**

```
✅ Código
  [ ] TypeScript sem erros (npm run type-check)
  [ ] ESLint sem erros (npm run lint)
  [ ] Prettier aplicado (npm run format)
  [ ] Imports organizados
  [ ] Sem console.log

✅ Componentes
  [ ] Componentes < 250 linhas
  [ ] Props tipadas
  [ ] Nomes descritivos
  [ ] Sem lógica complexa no JSX
  [ ] Early returns para loading/error

✅ Lógica
  [ ] Custom hooks para lógica reutilizável
  [ ] Sem código duplicado
  [ ] Funções puras quando possível
  [ ] Tratamento de erros

✅ Performance
  [ ] Memo quando necessário
  [ ] Lazy loading de rotas
  [ ] Otimização de re-renders
  [ ] Assets otimizados

✅ Testes (Recomendado)
  [ ] Testes para lógica crítica
  [ ] Testes passando
  [ ] Coverage adequado
```

---

## 🆘 Solução de Problemas

### **Erro de Type:**
1. Verifique o TypeScript strict mode
2. Use type guards quando necessário
3. Evite type assertion (`as`) quando possível

### **Performance:**
1. Use React DevTools Profiler
2. Verifique re-renders desnecessários
3. Implemente memoization (memo, useMemo, useCallback)
4. Lazy load componentes pesados

### **Estado:**
1. Prefira estado local quando possível
2. Use Zustand para estado global complexo
3. Use React Query para server state
4. Evite props drilling

---

## 📝 Exemplo de Componente Ideal

```typescript
// components/UserCard/UserCard.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/api/users'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import type { User } from '@/types/user'

interface UserCardProps {
  userId: string
  onEdit?: (user: User) => void
  className?: string
}

export function UserCard({ userId, onEdit, className }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId)
  })

  const handleEdit = () => {
    if (user && onEdit) {
      onEdit(user)
    }
  }

  if (isLoading) {
    return <Card.Skeleton />
  }

  if (error || !user) {
    return <Card.Error message="Falha ao carregar usuário" />
  }

  return (
    <Card className={className}>
      <Card.Header>
        <Avatar src={user.avatar} alt={user.name} />
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      </Card.Header>

      {isExpanded && (
        <Card.Body>
          <p>Telefone: {user.phone}</p>
          <p>Empresa: {user.company}</p>
        </Card.Body>
      )}

      <Card.Footer>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Ver menos' : 'Ver mais'}
        </button>
        <button onClick={handleEdit}>Editar</button>
      </Card.Footer>
    </Card>
  )
}
```

---

## 📅 Histórico de Versões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0 | 2025-10-27 | Versão inicial |

---

**Última atualização:** 2025-10-27
**Mantido por:** Equipe de Frontend CRM

---

## 🔗 Links Rápidos

- [React Best Practices](./React-TypeScript-Best-Practices.md)
- [Clean Code Frontend](./Clean-Code-Frontend.md)
- [Modern Page Design Pattern](./Modern-Page-Design-Pattern.md) ⭐ **NOVO**
- [Components Architecture](./Components-Architecture.md)
- [State Management](./State-Management-Guide.md)
- [Testing Guide](./Testing-Guide.md)
- [Table UX Practices](./Table-UX-Practices.md)
