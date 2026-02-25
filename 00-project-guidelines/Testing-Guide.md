# Guia de Testes - React + TypeScript

**Versão:** 1.0
**Data:** 2025-10-27

---

## 📋 Índice

1. [Stack de Testes](#stack-de-testes)
2. [Tipos de Testes](#tipos-de-testes)
3. [Testing Library](#testing-library)
4. [Unit Tests](#unit-tests)
5. [Component Tests](#component-tests)
6. [Integration Tests](#integration-tests)
7. [E2E Tests](#e2e-tests)
8. [Mocking](#mocking)
9. [Best Practices](#best-practices)

---

## Stack de Testes

```typescript
// Recomendado para React + TypeScript

// Test Runner
- Vitest (rápido, compatível com Vite)
- Jest (alternativa popular)

// Testing Library
- @testing-library/react
- @testing-library/user-event
- @testing-library/jest-dom

// E2E
- Playwright (recomendado)
- Cypress (alternativa)

// Mocking
- MSW (Mock Service Worker) - API mocking
```

### **Configuração Vitest**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

// src/test/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Cleanup após cada teste
afterEach(() => {
  cleanup()
})
```

---

## Tipos de Testes

### **Pirâmide de Testes**

```
        /\
       /  \      E2E Tests (poucos, lentos, caros)
      /____\
     /      \    Integration Tests (alguns, médios)
    /________\
   /          \  Unit Tests (muitos, rápidos, baratos)
  /__________\
```

### **O que testar?**

```typescript
// ✅ SEMPRE testar:
- Lógica de negócio (utils, helpers)
- Custom hooks
- Componentes críticos
- Fluxos principais (login, checkout)

// ⚠️ TESTAR SE POSSÍVEL:
- Componentes de UI complexos
- Formulários
- Integrações com API

// ❌ NÃO PRECISA testar:
- Bibliotecas externas (já testadas)
- Componentes muito simples (Button, Input)
- Tipos TypeScript (compilador faz isso)
```

---

## Testing Library

### **Princípios**

> "The more your tests resemble the way your software is used, the more confidence they can give you."

```typescript
// ✅ BOM - Testar como usuário usa
const button = screen.getByRole('button', { name: /enviar/i })
const input = screen.getByLabelText(/email/i)

// ❌ MAU - Detalhes de implementação
const button = container.querySelector('.btn-primary')
const input = container.querySelector('#email-input')
```

### **Queries Recomendadas (em ordem de preferência)**

```typescript
// 1. Accessible to everyone (preferir)
screen.getByRole('button', { name: /enviar/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/digite seu email/i)
screen.getByText(/bem-vindo/i)
screen.getByDisplayValue(/john@example.com/i)

// 2. Semantic queries
screen.getByAltText(/logo da empresa/i)
screen.getByTitle(/fechar modal/i)

// 3. Test IDs (último recurso)
screen.getByTestId('submit-button')
```

---

## Unit Tests

### **Testar Funções/Utils**

```typescript
// utils/date.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// utils/date.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, isToday } from './date'

describe('formatDate', () => {
  it('should format date in pt-BR format', () => {
    const date = new Date('2025-10-27')
    expect(formatDate(date)).toBe('27/10/2025')
  })
})

describe('isToday', () => {
  it('should return true for today', () => {
    const today = new Date()
    expect(isToday(today)).toBe(true)
  })

  it('should return false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday)).toBe(false)
  })
})
```

### **Testar Custom Hooks**

```typescript
// hooks/useToggle.ts
import { useState, useCallback } from 'react'

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}

// hooks/useToggle.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  it('should initialize with default value false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current.value).toBe(false)
  })

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current.value).toBe(true)
  })

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.value).toBe(false)
  })

  it('should set value to true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current.setTrue()
    })

    expect(result.current.value).toBe(true)
  })

  it('should set value to false', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current.setFalse()
    })

    expect(result.current.value).toBe(false)
  })
})
```

---

## Component Tests

### **Componente Simples**

```typescript
// components/Button/Button.tsx
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick} disabled>Click me</Button>)

    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply correct variant class', () => {
    render(<Button variant="secondary">Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')
  })
})
```

### **Componente com Estado**

```typescript
// components/Counter/Counter.tsx
export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  )
}

// components/Counter/Counter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Counter } from './Counter'

describe('Counter', () => {
  it('should start with count 0', () => {
    render(<Counter />)
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
  })

  it('should increment count', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /increment/i }))

    expect(screen.getByText(/count: 1/i)).toBeInTheDocument()
  })

  it('should decrement count', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /decrement/i }))

    expect(screen.getByText(/count: -1/i)).toBeInTheDocument()
  })

  it('should reset count', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
  })
})
```

### **Componente com Form**

```typescript
// components/LoginForm/LoginForm.tsx
interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit">Entrar</button>
    </form>
  )
}

// components/LoginForm/LoginForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('should render form fields', () => {
    render(<LoginForm onSubmit={vi.fn()} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('should submit form with email and password', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123'
    })
  })

  it('should not submit form if fields are empty', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(handleSubmit).not.toHaveBeenCalled()
  })
})
```

---

## Integration Tests

### **Testar Fluxo Completo**

```typescript
// tests/integration/login.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { App } from '@/App'
import { server } from '@/test/mocks/server'
import { rest } from 'msw'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Login Flow', () => {
  it('should login successfully and redirect to dashboard', async () => {
    const user = userEvent.setup()

    renderWithProviders(<App />)

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'password123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    // Verificar redirecionamento
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Verificar dados do usuário
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it('should show error message on failed login', async () => {
    const user = userEvent.setup()

    // Mock erro de API
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ message: 'Credenciais inválidas' })
        )
      })
    )

    renderWithProviders(<App />)

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
    })
  })
})
```

---

## Mocking

### **MSW (Mock Service Worker)**

```typescript
// test/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  // GET /users
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
      ])
    )
  }),

  // GET /users/:id
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: 'John Doe',
        email: 'john@example.com'
      })
    )
  }),

  // POST /users
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json()
    return res(
      ctx.status(201),
      ctx.json({
        id: '3',
        ...body
      })
    )
  }),

  // POST /auth/login
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json()

    if (email === 'john@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: { id: '1', name: 'John Doe', email },
          token: 'fake-token'
        })
      )
    }

    return res(
      ctx.status(401),
      ctx.json({ message: 'Credenciais inválidas' })
    )
  })
]

// test/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### **Mock de Módulos**

```typescript
// Mock de hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', name: 'John Doe' },
    isAuthenticated: true,
    logout: vi.fn()
  }))
}))

// Mock de serviço
vi.mock('@/services/api/users', () => ({
  userService: {
    getAll: vi.fn(() => Promise.resolve([])),
    getById: vi.fn((id: string) => Promise.resolve({ id, name: 'John' })),
    create: vi.fn((data) => Promise.resolve({ id: '1', ...data }))
  }
}))
```

---

## Best Practices

### **✅ DO:**

```typescript
// ✅ Testar comportamento, não implementação
test('should show error when email is invalid', async () => {
  // Testar o que o usuário vê/faz
})

// ✅ Use screen.getByRole (acessibilidade)
screen.getByRole('button', { name: /enviar/i })

// ✅ Use userEvent (simula usuário real)
const user = userEvent.setup()
await user.click(button)

// ✅ Use waitFor para operações assíncronas
await waitFor(() => {
  expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
})

// ✅ Cleanup automático (Testing Library faz isso)
afterEach(() => {
  cleanup()
})

// ✅ AAA Pattern (Arrange, Act, Assert)
test('should increment counter', async () => {
  // Arrange
  render(<Counter />)
  const button = screen.getByRole('button', { name: /increment/i })

  // Act
  await user.click(button)

  // Assert
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument()
})
```

### **❌ DON'T:**

```typescript
// ❌ Não teste detalhes de implementação
expect(component.state.count).toBe(1)

// ❌ Não use querySelector
container.querySelector('.btn-primary')

// ❌ Não teste código de terceiros
test('should useState work', () => {
  // React já testa isso
})

// ❌ Não use sleep/setTimeout
await new Promise(resolve => setTimeout(resolve, 1000))

// ✅ Use waitFor
await waitFor(() => expect(...).toBeInTheDocument())
```

---

## Comandos

```bash
# Rodar todos os testes
npm run test

# Modo watch
npm run test:watch

# Coverage
npm run test:coverage

# UI mode (Vitest)
npm run test:ui

# E2E
npm run test:e2e
```

---

**Última atualização:** 2025-10-27
