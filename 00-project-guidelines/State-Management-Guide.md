# Gerenciamento de Estado - React

**Versão:** 1.0
**Data:** 2025-10-27

---

## 📋 Índice

1. [Quando Usar Cada Tipo](#quando-usar-cada-tipo)
2. [Local State (useState)](#local-state-usestate)
3. [Context API](#context-api)
4. [Zustand (Global State)](#zustand-global-state)
5. [React Query (Server State)](#react-query-server-state)
6. [Form State](#form-state)
7. [URL State](#url-state)
8. [Best Practices](#best-practices)

---

## Quando Usar Cada Tipo

```typescript
// 🎯 REGRA DE OURO: Use o estado mais simples possível

// ✅ Local State
// - Estado usado apenas no componente
// - UI state (isOpen, isExpanded)
const [isOpen, setIsOpen] = useState(false)

// ✅ Context API
// - Estado compartilhado por poucos componentes
// - Tema, idioma, user preferences
const ThemeContext = createContext<Theme>('light')

// ✅ Zustand (Global State)
// - Estado global da aplicação
// - Auth state, user data, app config
const useAuthStore = create<AuthState>(...)

// ✅ React Query (Server State)
// - Dados do servidor (API)
// - Cache, refetch, mutations
const { data } = useQuery(['users'], fetchUsers)

// ✅ Form State
// - Estado de formulários
// - React Hook Form + Zod
const form = useForm<FormData>()

// ✅ URL State
// - Estado na URL (search, filters, pagination)
// - useSearchParams, useParams
const [searchParams] = useSearchParams()
```

---

## Local State (useState)

### **Quando usar:**
- Estado usado apenas dentro do componente
- UI state (modals, dropdowns, expanded/collapsed)
- Estado temporário (input values, form drafts)

### **✅ Boas Práticas**

```typescript
// ✅ BOM - Estado simples
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}

// ✅ BOM - Agrupar estados relacionados
interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form>
      <input
        value={formData.email}
        onChange={e => handleChange('email', e.target.value)}
      />
      <input
        value={formData.password}
        onChange={e => handleChange('password', e.target.value)}
      />
    </form>
  )
}
```

### **❌ Anti-patterns**

```typescript
// ❌ MAU - Muitos estados separados
function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  // ... mais 10 estados
}

// ✅ BOM - Agrupar em objeto
function Form() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })
}
```

---

## Context API

### **Quando usar:**
- Estado compartilhado entre componentes próximos
- Tema, idioma, preferências do usuário
- Evitar props drilling (mas não abuse!)

### **✅ Theme Context**

```typescript
// contexts/ThemeContext.tsx
type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

// Uso:
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  )
}

function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className={theme}>
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  )
}
```

### **✅ User Context**

```typescript
// contexts/UserContext.tsx
interface User {
  id: string
  name: string
  email: string
}

interface UserContextValue {
  user: User | null
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
```

### **⚠️ Context Performance**

```typescript
// ❌ MAU - Re-render desnecessário
const AppContext = createContext({ user, theme, settings, ...many })

// ✅ BOM - Separar contexts
const UserContext = createContext(user)
const ThemeContext = createContext(theme)
const SettingsContext = createContext(settings)

// ✅ BOM - Memoizar valores
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const value = useMemo(
    () => ({ user, setUser }),
    [user]
  )

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
```

---

## Zustand (Global State)

### **Quando usar:**
- Estado global da aplicação
- Auth state
- Configurações globais
- Estado que precisa persistir

### **✅ Auth Store**

```typescript
// stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(email, password)
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setToken: (token: string | null) => {
        set({ token })
      }
    }),
    {
      name: 'auth-storage', // Nome no localStorage
      partialize: (state) => ({
        // Salvar apenas user e token
        user: state.user,
        token: state.token
      })
    }
  )
)

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

// Selecionar apenas o necessário (performance)
function UserName() {
  const userName = useAuthStore(state => state.user?.name)
  return <span>{userName}</span>
}
```

### **✅ Settings Store**

```typescript
// stores/settingsStore.ts
interface SettingsState {
  language: 'pt' | 'en' | 'es'
  theme: 'light' | 'dark'
  notificationsEnabled: boolean

  setLanguage: (language: SettingsState['language']) => void
  setTheme: (theme: SettingsState['theme']) => void
  toggleNotifications: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt',
      theme: 'light',
      notificationsEnabled: true,

      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleNotifications: () =>
        set(state => ({ notificationsEnabled: !state.notificationsEnabled }))
    }),
    {
      name: 'settings-storage'
    }
  )
)
```

### **✅ UI Store (para modals, sidebars, etc)**

```typescript
// stores/uiStore.ts
interface UIState {
  isModalOpen: boolean
  isSidebarOpen: boolean
  activeModal: string | null

  openModal: (modalId: string) => void
  closeModal: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  isSidebarOpen: true,
  activeModal: null,

  openModal: (modalId: string) =>
    set({ isModalOpen: true, activeModal: modalId }),

  closeModal: () =>
    set({ isModalOpen: false, activeModal: null }),

  toggleSidebar: () =>
    set(state => ({ isSidebarOpen: !state.isSidebarOpen }))
}))

// Uso:
function UserModal() {
  const { activeModal, closeModal } = useUIStore()

  return (
    <Modal
      isOpen={activeModal === 'user-modal'}
      onClose={closeModal}
    >
      <UserForm />
    </Modal>
  )
}
```

---

## React Query (Server State)

### **Quando usar:**
- Dados do servidor (API)
- Cache automático
- Refetch, polling
- Mutations (create, update, delete)

### **✅ Query Hooks**

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/services/api/users'
import type { User, CreateUserInput } from '@/types/user'

// GET /users
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000 // 10 minutos
  })
}

// GET /users/:id
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId, // Só executa se userId existir
    staleTime: 5 * 60 * 1000
  })
}

// POST /users
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: (newUser) => {
      // Invalidar cache de users
      queryClient.invalidateQueries({ queryKey: ['users'] })

      // Ou adicionar otimisticamente
      queryClient.setQueryData<User[]>(
        ['users'],
        (old = []) => [...old, newUser]
      )
    }
  })
}

// PUT /users/:id
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (updatedUser) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        ['user', updatedUser.id],
        updatedUser
      )
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

// DELETE /users/:id
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => userService.delete(userId),
    onSuccess: (_, userId) => {
      // Remover do cache otimisticamente
      queryClient.setQueryData<User[]>(
        ['users'],
        (old = []) => old.filter(user => user.id !== userId)
      )
    }
  })
}

// Uso:
function UsersList() {
  const { data: users, isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  if (isLoading) return <Loading />
  if (error) return <Error message={error.message} />

  return (
    <div>
      {users?.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onDelete={() => deleteUser.mutate(user.id)}
        />
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

### **✅ Infinite Query (Pagination)**

```typescript
// hooks/useInfiniteUsers.ts
export function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      userService.getAll({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    }
  })
}

// Uso:
function UsersList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteUsers()

  return (
    <div>
      {data?.pages.map(page =>
        page.users.map(user => (
          <UserCard key={user.id} user={user} />
        ))
      )}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  )
}
```

---

## Form State

### **React Hook Form + Zod**

```typescript
// schemas/userSchema.ts
import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword']
})

export type UserFormData = z.infer<typeof userSchema>

// components/UserForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  })

  const onSubmit = async (data: UserFormData) => {
    await createUser(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        label="Nome"
        {...register('name')}
        error={errors.name?.message}
      />

      <InputField
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <InputField
        label="Senha"
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />

      <InputField
        label="Confirmar Senha"
        type="password"
        {...register('confirmPassword')}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" isLoading={isSubmitting}>
        Cadastrar
      </Button>
    </form>
  )
}
```

---

## URL State

### **useSearchParams (Search/Filters)**

```typescript
// hooks/useFilters.ts
import { useSearchParams } from 'react-router-dom'

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    page: Number(searchParams.get('page')) || 1
  }

  const setFilter = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) {
        prev.set(key, value)
      } else {
        prev.delete(key)
      }
      return prev
    })
  }

  return { filters, setFilter }
}

// Uso:
function UsersList() {
  const { filters, setFilter } = useFilters()
  const { data: users } = useUsers(filters)

  return (
    <div>
      <input
        value={filters.search}
        onChange={e => setFilter('search', e.target.value)}
      />
      <select
        value={filters.status}
        onChange={e => setFilter('status', e.target.value)}
      >
        <option value="all">Todos</option>
        <option value="active">Ativos</option>
        <option value="inactive">Inativos</option>
      </select>
      {users?.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  )
}
```

---

## Best Practices

### **✅ DO:**

1. **Use o estado mais simples possível**
2. **Prefira local state quando possível**
3. **Use React Query para server state**
4. **Zustand para global app state**
5. **Context apenas para poucos componentes**
6. **Agrupar estados relacionados**
7. **Memoizar valores de context**
8. **Usar selectors no Zustand (performance)**

### **❌ DON'T:**

1. **Não abuse do Context (re-renders)**
2. **Não use Redux se não precisar**
3. **Não misture server state com client state**
4. **Não coloque tudo no global state**
5. **Não esqueça de memoizar contexts**

---

**Última atualização:** 2025-10-27
