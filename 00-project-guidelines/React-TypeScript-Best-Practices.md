# React + TypeScript - Boas Práticas

**Versão:** 1.0
**Data:** 2025-10-27

---

## 📋 Índice

1. [TypeScript Essentials](#typescript-essentials)
2. [React Components](#react-components)
3. [Hooks](#hooks)
4. [Props e Types](#props-e-types)
5. [State Management](#state-management)
6. [Performance](#performance)
7. [Error Handling](#error-handling)
8. [Boas Práticas Gerais](#boas-práticas-gerais)

---

## TypeScript Essentials

### **✅ SEMPRE use TypeScript strict mode**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### **❌ NUNCA use `any`**

```typescript
// ❌ MAU
function handleData(data: any) {
  return data.name
}

// ✅ BOM
interface User {
  name: string
  email: string
}

function handleData(data: User) {
  return data.name
}

// ✅ BOM - Para casos realmente genéricos
function handleData<T extends { name: string }>(data: T) {
  return data.name
}
```

### **Type vs Interface**

```typescript
// ✅ Use Interface para objetos e componentes
interface User {
  id: string
  name: string
  email: string
}

interface UserCardProps {
  user: User
  onEdit: (user: User) => void
}

// ✅ Use Type para unions, intersections e utilitários
type Status = 'pending' | 'active' | 'inactive'
type UserWithTimestamps = User & {
  createdAt: Date
  updatedAt: Date
}

// ✅ Type para funções complexas
type EventHandler = (event: React.MouseEvent<HTMLButtonElement>) => void
```

### **Utility Types**

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
}

// ✅ Partial - Todos os campos opcionais
type UserUpdate = Partial<User>

// ✅ Pick - Selecionar campos específicos
type UserPreview = Pick<User, 'id' | 'name' | 'email'>

// ✅ Omit - Remover campos
type UserPublic = Omit<User, 'password'>

// ✅ Required - Todos os campos obrigatórios
type UserRequired = Required<User>

// ✅ Record - Criar objeto com keys conhecidas
type UserRole = Record<'admin' | 'user' | 'guest', string[]>
```

---

## React Components

### **Componentes Funcionais**

```typescript
// ✅ BOM - Component Function com tipos explícitos
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false
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

// ✅ Alternativa - React.FC (mais verboso)
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
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
```

### **Props com Tipos Complexos**

```typescript
// ✅ BOM - Props bem tipadas
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void | Promise<void>
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  children,
  className,
  style
}: UserCardProps) {
  const handleEdit = () => {
    onEdit?.(user)
  }

  const handleDelete = async () => {
    await onDelete?.(user.id)
  }

  return (
    <div className={className} style={style}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      {children}
      <button onClick={handleEdit}>Editar</button>
      <button onClick={handleDelete}>Deletar</button>
    </div>
  )
}
```

### **Componentes com Generics**

```typescript
// ✅ BOM - Componente genérico reutilizável
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'Nenhum item encontrado'
}: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  )
}

// Uso:
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
/>
```

---

## Hooks

### **useState**

```typescript
// ✅ BOM - Type inference automático
const [count, setCount] = useState(0)
const [name, setName] = useState('')

// ✅ BOM - Type explícito quando necessário
const [user, setUser] = useState<User | null>(null)
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

// ✅ BOM - Interface para objetos complexos
interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

const [formData, setFormData] = useState<FormData>({
  email: '',
  password: '',
  rememberMe: false
})
```

### **useEffect**

```typescript
// ✅ BOM - Effect com tipos corretos
useEffect(() => {
  const fetchUser = async () => {
    try {
      const data = await userService.getById(userId)
      setUser(data)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  fetchUser()
}, [userId])

// ✅ BOM - Effect com cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    console.log('Timer finished')
  }, 1000)

  return () => {
    clearTimeout(timer)
  }
}, [])
```

### **useRef**

```typescript
// ✅ BOM - Ref para DOM elements
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  inputRef.current?.focus()
}, [])

// ✅ BOM - Ref para valores mutáveis
const countRef = useRef<number>(0)

const increment = () => {
  countRef.current += 1
  console.log(countRef.current)
}
```

### **Custom Hooks**

```typescript
// ✅ BOM - Custom hook bem tipado
interface UseUserOptions {
  onSuccess?: (user: User) => void
  onError?: (error: Error) => void
}

function useUser(userId: string, options?: UseUserOptions) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await userService.getById(userId)
        setUser(data)
        options?.onSuccess?.(data)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        options?.onError?.(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  return { user, isLoading, error }
}

// Uso:
const { user, isLoading, error } = useUser('123', {
  onSuccess: (user) => console.log('User loaded:', user),
  onError: (error) => console.error('Error:', error)
})
```

### **useCallback e useMemo**

```typescript
// ✅ BOM - useCallback com tipos
interface User {
  id: string
  name: string
}

const handleUserClick = useCallback((user: User) => {
  console.log('User clicked:', user.name)
}, [])

// ✅ BOM - useMemo com tipos
const sortedUsers = useMemo(() => {
  return users.sort((a, b) => a.name.localeCompare(b.name))
}, [users])

// ✅ BOM - useMemo para cálculos caros
const expensiveValue = useMemo<number>(() => {
  return complexCalculation(data)
}, [data])
```

---

## Props e Types

### **React.ReactNode vs React.ReactElement**

```typescript
// ✅ ReactNode - Qualquer coisa renderizável
interface ContainerProps {
  children: React.ReactNode // string, number, JSX, array, etc
}

// ✅ ReactElement - Apenas elementos JSX
interface LayoutProps {
  header: React.ReactElement
  content: React.ReactElement
}

// ✅ Função que retorna ReactNode
interface RenderProps {
  render: (data: User) => React.ReactNode
}
```

### **Event Handlers**

```typescript
// ✅ BOM - Event handlers tipados
interface FormProps {
  onSubmit: (data: FormData) => void
}

function Form({ onSubmit }: FormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(Object.fromEntries(formData) as FormData)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Button clicked')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Submit</button>
    </form>
  )
}
```

### **Extending HTML Attributes**

```typescript
// ✅ BOM - Extender atributos nativos
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  isLoading,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${className || ''}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Carregando...' : children}
    </button>
  )
}

// Uso - Todos os atributos HTML funcionam:
<Button
  variant="primary"
  onClick={() => {}}
  type="submit"
  aria-label="Submit form"
>
  Enviar
</Button>
```

---

## State Management

### **Local State**

```typescript
// ✅ BOM - Estado local simples
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

### **Zustand (Global State)**

```typescript
// stores/authStore.ts
import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const user = await authService.login(email, password)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user })
  }
}))

// Uso:
function Header() {
  const { user, logout } = useAuthStore()

  return (
    <header>
      <span>{user?.name}</span>
      <button onClick={logout}>Sair</button>
    </header>
  )
}
```

### **React Query**

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/api/users'
import type { User, CreateUserInput } from '@/types/user'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  })
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId // Só executa se userId existir
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// Uso:
function UsersList() {
  const { data: users, isLoading, error } = useUsers()
  const createUser = useCreateUser()

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar usuários</div>

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => createUser.mutate({
        name: 'John',
        email: 'john@example.com'
      })}>
        Criar Usuário
      </button>
    </div>
  )
}
```

---

## Performance

### **React.memo**

```typescript
// ✅ BOM - Memo para componentes que re-renderizam sem necessidade
interface UserCardProps {
  user: User
  onEdit: (user: User) => void
}

export const UserCard = React.memo<UserCardProps>(({ user, onEdit }) => {
  console.log('UserCard renderizado')

  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user)}>Editar</button>
    </div>
  )
})

UserCard.displayName = 'UserCard'
```

### **useCallback para funções**

```typescript
// ✅ BOM - useCallback para evitar re-criação de funções
function UsersList() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ❌ MAU - Função recriada a cada render
  const handleSelect = (userId: string) => {
    setSelectedId(userId)
  }

  // ✅ BOM - Função memoizada
  const handleSelectMemo = useCallback((userId: string) => {
    setSelectedId(userId)
  }, [])

  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onSelect={handleSelectMemo} // Mesma função em todos os renders
        />
      ))}
    </div>
  )
}
```

### **useMemo para valores caros**

```typescript
// ✅ BOM - useMemo para cálculos caros
function UsersList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    console.log('Sorting users...')
    return [...users].sort((a, b) => a.name.localeCompare(b.name))
  }, [users])

  const userCount = useMemo(() => {
    return sortedUsers.length
  }, [sortedUsers])

  return (
    <div>
      <p>Total: {userCount} usuários</p>
      {sortedUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### **Code Splitting & Lazy Loading**

```typescript
// ✅ BOM - Lazy load de rotas
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Users = lazy(() => import('./pages/Users'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

---

## Error Handling

### **Error Boundaries**

```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h1>Algo deu errado</h1>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}

// Uso:
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### **Try/Catch em Async**

```typescript
// ✅ BOM - Error handling em hooks
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await userService.getById(userId)
        setUser(data)
      } catch (err) {
        const error = err instanceof Error
          ? err
          : new Error('Erro desconhecido')
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  return { user, error, isLoading }
}
```

---

## Boas Práticas Gerais

### **1. Sempre use TypeScript strict mode**
### **2. Nunca use `any` - prefira `unknown`**
### **3. Componentes pequenos (< 250 linhas)**
### **4. Extraia lógica para custom hooks**
### **5. Use path aliases (@/)**
### **6. Organize imports**

```typescript
// ✅ BOM - Ordem de imports
// 1. Externos
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internos (com alias)
import { Button } from '@/components/ui/Button'
import { userService } from '@/services/api/users'
import { useAuthStore } from '@/stores/authStore'

// 3. Types
import type { User } from '@/types/user'

// 4. Relativos
import { Header } from './Header'
import styles from './UserCard.module.css'
```

### **7. Prefira composição sobre prop drilling**

```typescript
// ❌ MAU - Props drilling
<UserPage>
  <UserHeader user={user} />
  <UserBody user={user} />
  <UserFooter user={user} />
</UserPage>

// ✅ BOM - Context ou composição
const UserContext = createContext<User | null>(null)

<UserContext.Provider value={user}>
  <UserPage>
    <UserHeader />
    <UserBody />
    <UserFooter />
  </UserPage>
</UserContext.Provider>
```

### **8. Type guards quando necessário**

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'email' in value
  )
}

// Uso:
const data = await api.get('/user')
if (isUser(data)) {
  console.log(data.name) // TypeScript sabe que é User
}
```

---

**Última atualização:** 2025-10-27
