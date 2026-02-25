# Clean Code - Frontend React

**Versão:** 1.0
**Data:** 2025-10-27

---

## 📋 Índice

1. [Princípios SOLID](#princípios-solid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
4. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
5. [Nomenclatura](#nomenclatura)
6. [Funções](#funções)
7. [Componentes](#componentes)
8. [Code Smells](#code-smells)
9. [Refactoring](#refactoring)

---

## Princípios SOLID

### **S - Single Responsibility Principle (SRP)**

> Um componente deve ter apenas uma responsabilidade

```typescript
// ❌ MAU - Componente faz muitas coisas
function UserProfile() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])

  // Busca dados
  useEffect(() => {
    fetchUser()
    fetchPosts()
    fetchComments()
  }, [])

  // Renderiza tudo
  return (
    <div>
      <div className="header">...</div>
      <div className="posts">...</div>
      <div className="comments">...</div>
      <div className="sidebar">...</div>
    </div>
  )
}

// ✅ BOM - Separar responsabilidades
function UserProfile() {
  return (
    <div>
      <UserHeader />
      <UserPosts />
      <UserComments />
      <UserSidebar />
    </div>
  )
}

function UserHeader() {
  const { user, isLoading } = useUser()

  if (isLoading) return <HeaderSkeleton />

  return (
    <header>
      <Avatar src={user.avatar} />
      <h1>{user.name}</h1>
    </header>
  )
}
```

### **O - Open/Closed Principle (OCP)**

> Aberto para extensão, fechado para modificação

```typescript
// ❌ MAU - Precisa modificar o componente para adicionar novos tipos
function Button({ type, children }: { type: string; children: ReactNode }) {
  if (type === 'primary') {
    return <button className="btn-primary">{children}</button>
  }
  if (type === 'secondary') {
    return <button className="btn-secondary">{children}</button>
  }
  if (type === 'danger') {
    return <button className="btn-danger">{children}</button>
  }
  return <button>{children}</button>
}

// ✅ BOM - Extensível via composição
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}

// Extender sem modificar
function DangerButton(props: ButtonProps) {
  return <Button {...props} variant="danger" />
}
```

### **L - Liskov Substitution Principle (LSP)**

> Subtipos devem ser substituíveis por seus tipos base

```typescript
// ✅ BOM - Todos os botões podem ser substituídos
interface BaseButtonProps {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
}

function BaseButton({ onClick, disabled, children }: BaseButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function PrimaryButton(props: BaseButtonProps) {
  return <BaseButton {...props} />
}

function SecondaryButton(props: BaseButtonProps) {
  return <BaseButton {...props} />
}

// Qualquer um pode ser usado no mesmo lugar
function Form() {
  return (
    <form>
      <PrimaryButton onClick={handleSubmit}>Enviar</PrimaryButton>
      <SecondaryButton onClick={handleCancel}>Cancelar</SecondaryButton>
    </form>
  )
}
```

### **I - Interface Segregation Principle (ISP)**

> Não force componentes a depender de interfaces que não usam

```typescript
// ❌ MAU - Interface muito grande
interface UserCardProps {
  user: User
  showAvatar: boolean
  showEmail: boolean
  showPhone: boolean
  showAddress: boolean
  onEdit: () => void
  onDelete: () => void
  onShare: () => void
  onExport: () => void
}

// ✅ BOM - Interfaces segregadas
interface UserCardProps {
  user: User
  variant?: 'compact' | 'full'
}

interface UserCardActionsProps {
  onEdit?: () => void
  onDelete?: () => void
}

function UserCard({ user, variant = 'compact' }: UserCardProps) {
  return (
    <div>
      <Avatar src={user.avatar} />
      <h3>{user.name}</h3>
      {variant === 'full' && <p>{user.email}</p>}
    </div>
  )
}

function UserCardActions({ onEdit, onDelete }: UserCardActionsProps) {
  return (
    <div>
      {onEdit && <button onClick={onEdit}>Editar</button>}
      {onDelete && <button onClick={onDelete}>Deletar</button>}
    </div>
  )
}
```

### **D - Dependency Inversion Principle (DIP)**

> Dependa de abstrações, não de implementações concretas

```typescript
// ❌ MAU - Componente depende de implementação específica
function UserList() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Acoplado à API específica
    fetch('https://api.example.com/users')
      .then(res => res.json())
      .then(setUsers)
  }, [])

  return <div>{users.map(user => <UserCard key={user.id} user={user} />)}</div>
}

// ✅ BOM - Depende de abstração (interface)
interface UserService {
  getAll(): Promise<User[]>
  getById(id: string): Promise<User>
}

// Hook abstrai a fonte de dados
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll() // Implementação pode mudar
  })
}

function UserList() {
  const { data: users, isLoading } = useUsers() // Não sabe de onde vem

  if (isLoading) return <Loading />

  return <div>{users?.map(user => <UserCard key={user.id} user={user} />)}</div>
}
```

---

## DRY - Don't Repeat Yourself

### **Evitar código duplicado**

```typescript
// ❌ MAU - Código duplicado
function LoginForm() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (!value.includes('@')) {
      setEmailError('Email inválido')
    } else {
      setEmailError('')
    }
  }

  return (
    <div>
      <input value={email} onChange={handleEmailChange} />
      {emailError && <span>{emailError}</span>}
    </div>
  )
}

function SignupForm() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (!value.includes('@')) {
      setEmailError('Email inválido')
    } else {
      setEmailError('')
    }
  }

  return (
    <div>
      <input value={email} onChange={handleEmailChange} />
      {emailError && <span>{emailError}</span>}
    </div>
  )
}

// ✅ BOM - Extrair para hook reutilizável
function useEmailInput() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setError(!value.includes('@') ? 'Email inválido' : '')
  }

  return { email, error, handleChange }
}

function LoginForm() {
  const { email, error, handleChange } = useEmailInput()

  return (
    <div>
      <input value={email} onChange={handleChange} />
      {error && <span>{error}</span>}
    </div>
  )
}

function SignupForm() {
  const { email, error, handleChange } = useEmailInput()

  return (
    <div>
      <input value={email} onChange={handleChange} />
      {error && <span>{error}</span>}
    </div>
  )
}
```

---

## KISS - Keep It Simple, Stupid

### **Mantenha simples**

```typescript
// ❌ MAU - Complexo demais
function UserStatus({ user }: { user: User }) {
  const getStatusColor = () => {
    if (user.status === 'active') {
      return user.lastLogin && isToday(user.lastLogin) ? 'green' : 'lightgreen'
    } else if (user.status === 'inactive') {
      return user.deletedAt ? 'red' : 'orange'
    } else if (user.status === 'pending') {
      return user.emailVerified ? 'yellow' : 'gray'
    }
    return 'black'
  }

  return <span style={{ color: getStatusColor() }}>{user.status}</span>
}

// ✅ BOM - Simples e direto
const STATUS_COLORS: Record<User['status'], string> = {
  active: 'green',
  inactive: 'orange',
  pending: 'yellow'
}

function UserStatus({ user }: { user: User }) {
  const color = STATUS_COLORS[user.status]

  return <span style={{ color }}>{user.status}</span>
}
```

---

## YAGNI - You Aren't Gonna Need It

### **Não adicione funcionalidade até precisar**

```typescript
// ❌ MAU - Preparando para futuro hipotético
interface UserCardProps {
  user: User
  showAvatar?: boolean
  showEmail?: boolean
  showPhone?: boolean
  showAddress?: boolean
  showSocialLinks?: boolean
  showBio?: boolean
  avatarSize?: 'sm' | 'md' | 'lg' | 'xl'
  emailFormat?: 'full' | 'short' | 'masked'
  // ... mais 20 props que você "pode precisar"
}

// ✅ BOM - Apenas o necessário agora
interface UserCardProps {
  user: User
}

function UserCard({ user }: UserCardProps) {
  return (
    <div>
      <Avatar src={user.avatar} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}

// Adicione complexidade quando necessário
```

---

## Nomenclatura

### **Componentes: PascalCase**

```typescript
// ✅ BOM
export function UserCard() {}
export function LoginForm() {}
export function DashboardLayout() {}
```

### **Funções/Hooks: camelCase**

```typescript
// ✅ BOM
export function useUser() {}
export function useAuth() {}
export function formatDate() {}
export function validateEmail() {}
```

### **Constants: UPPER_SNAKE_CASE**

```typescript
// ✅ BOM
export const API_BASE_URL = 'https://api.example.com'
export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const DEFAULT_PAGE_SIZE = 20
```

### **Nomes Descritivos**

```typescript
// ❌ MAU
function calc(a: number, b: number) {
  return a + b
}

const u = getUser()
const d = new Date()

// ✅ BOM
function calculateTotal(price: number, quantity: number) {
  return price * quantity
}

const currentUser = getUser()
const createdAt = new Date()
```

### **Boolean: is/has/should prefix**

```typescript
// ✅ BOM
const isLoading = true
const hasError = false
const shouldRender = true
const canEdit = false
const isAuthenticated = true
```

### **Event Handlers: handle prefix**

```typescript
// ✅ BOM
const handleClick = () => {}
const handleSubmit = () => {}
const handleChange = () => {}
const handleUserSelect = () => {}
```

---

## Funções

### **Pequenas e focadas**

```typescript
// ❌ MAU - Função faz demais
function processUser(user: User) {
  // Validar
  if (!user.email) throw new Error('Email required')
  if (!user.name) throw new Error('Name required')

  // Transformar
  const normalized = {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim()
  }

  // Salvar
  api.post('/users', normalized)

  // Notificar
  toast.success('User created')

  // Atualizar UI
  setUsers(prev => [...prev, normalized])

  // Log
  console.log('User created:', normalized)
}

// ✅ BOM - Funções pequenas e focadas
function validateUser(user: User) {
  if (!user.email) throw new Error('Email required')
  if (!user.name) throw new Error('Name required')
}

function normalizeUser(user: User): User {
  return {
    ...user,
    email: user.email.toLowerCase(),
    name: user.name.trim()
  }
}

async function createUser(user: User) {
  validateUser(user)
  const normalized = normalizeUser(user)
  const created = await api.post('/users', normalized)
  return created
}

function handleCreateUser(user: User) {
  createUser(user)
    .then(created => {
      setUsers(prev => [...prev, created])
      toast.success('User created')
    })
    .catch(error => {
      toast.error(error.message)
    })
}
```

### **Poucos parâmetros**

```typescript
// ❌ MAU - Muitos parâmetros
function createUser(
  name: string,
  email: string,
  password: string,
  phone: string,
  address: string,
  city: string,
  country: string
) {
  // ...
}

// ✅ BOM - Objeto como parâmetro
interface CreateUserInput {
  name: string
  email: string
  password: string
  phone: string
  address: string
  city: string
  country: string
}

function createUser(input: CreateUserInput) {
  // ...
}

// Ou usar um object
createUser({
  name: 'John',
  email: 'john@example.com',
  password: '123456',
  phone: '123456789',
  address: 'Street 1',
  city: 'City',
  country: 'Country'
})
```

### **Retorno early**

```typescript
// ❌ MAU - Nested ifs
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.emailVerified) {
        // Lógica principal aqui (muito aninhado)
        return user
      } else {
        return null
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

// ✅ BOM - Early returns
function processUser(user: User | null) {
  if (!user) return null
  if (!user.isActive) return null
  if (!user.emailVerified) return null

  // Lógica principal aqui (sem nesting)
  return user
}
```

---

## Componentes

### **Single Responsibility**

```typescript
// ❌ MAU - Componente faz tudo
function UserDashboard() {
  // Estado
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Efeitos
  useEffect(() => {
    fetchUsers()
  }, [])

  // Handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  // Renderizar tudo
  return (
    <div>
      <input value={searchTerm} onChange={e => handleSearch(e.target.value)} />
      <table>...</table>
      <Modal isOpen={isModalOpen}>...</Modal>
    </div>
  )
}

// ✅ BOM - Separar responsabilidades
function UserDashboard() {
  return (
    <div>
      <UserSearch />
      <UserTable />
      <UserModal />
    </div>
  )
}

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <input
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      placeholder="Buscar usuários..."
    />
  )
}

function UserTable() {
  const { users, isLoading } = useUsers()

  if (isLoading) return <Loading />

  return (
    <table>
      {users.map(user => (
        <UserRow key={user.id} user={user} />
      ))}
    </table>
  )
}

function UserModal() {
  const { selectedUser, isOpen, close } = useUserModal()

  return (
    <Modal isOpen={isOpen} onClose={close}>
      {selectedUser && <UserDetails user={selectedUser} />}
    </Modal>
  )
}
```

### **Composição sobre Prop Drilling**

```typescript
// ❌ MAU - Props drilling
function App() {
  const user = useUser()

  return <Dashboard user={user} />
}

function Dashboard({ user }: { user: User }) {
  return <Sidebar user={user} />
}

function Sidebar({ user }: { user: User }) {
  return <UserMenu user={user} />
}

function UserMenu({ user }: { user: User }) {
  return <div>{user.name}</div>
}

// ✅ BOM - Context
const UserContext = createContext<User | null>(null)

function App() {
  const user = useUser()

  return (
    <UserContext.Provider value={user}>
      <Dashboard />
    </UserContext.Provider>
  )
}

function UserMenu() {
  const user = useContext(UserContext)
  return <div>{user?.name}</div>
}
```

---

## Code Smells

### **🚨 Smell: Componente muito grande**

```typescript
// ❌ MAU - 500+ linhas
function UserDashboard() {
  // 500 linhas de código...
}

// ✅ BOM - Quebrar em componentes menores
function UserDashboard() {
  return (
    <>
      <UserHeader />
      <UserStats />
      <UserTable />
      <UserFooter />
    </>
  )
}
```

### **🚨 Smell: Muitos useState**

```typescript
// ❌ MAU - Estado fragmentado
function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  // ... mais 10 estados
}

// ✅ BOM - Agrupar estados relacionados
interface FormData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

function Form() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
}
```

### **🚨 Smell: useEffect com muitas dependências**

```typescript
// ❌ MAU - Effect complexo
useEffect(() => {
  if (user && data && isReady && !isLoading && hasPermission) {
    // Faz algo complexo
  }
}, [user, data, isReady, isLoading, hasPermission])

// ✅ BOM - Separar em effects específicos
useEffect(() => {
  if (user) {
    // Lógica relacionada ao user
  }
}, [user])

useEffect(() => {
  if (data && isReady) {
    // Lógica relacionada aos data
  }
}, [data, isReady])
```

---

## Refactoring

### **Extract Component**

```typescript
// Antes
function UserList() {
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <img src={user.avatar} />
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button>Editar</button>
          <button>Deletar</button>
        </div>
      ))}
    </div>
  )
}

// Depois
function UserList() {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}

function UserCard({ user }: { user: User }) {
  return (
    <div>
      <img src={user.avatar} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button>Editar</button>
      <button>Deletar</button>
    </div>
  )
}
```

### **Extract Hook**

```typescript
// Antes
function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchUser().then(setUser).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <Loading />

  return <div>{user?.name}</div>
}

// Depois
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchUser(userId).then(setUser).finally(() => setIsLoading(false))
  }, [userId])

  return { user, isLoading }
}

function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading } = useUser(userId)

  if (isLoading) return <Loading />

  return <div>{user?.name}</div>
}
```

---

**Última atualização:** 2025-10-27
