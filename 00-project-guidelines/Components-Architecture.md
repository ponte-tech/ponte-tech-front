# Arquitetura de Componentes React

**Versão:** 1.0
**Data:** 2025-10-27

---

## 📋 Índice

1. [Atomic Design](#atomic-design)
2. [Component Patterns](#component-patterns)
3. [Composition](#composition)
4. [Props Patterns](#props-patterns)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Best Practices](#best-practices)

---

## Atomic Design

### **Hierarquia de Componentes**

```
Atoms (Átomos)
├── Button
├── Input
├── Label
├── Icon
└── Avatar

Molecules (Moléculas)
├── InputField (Input + Label + Error)
├── SearchBar (Input + Button)
└── UserBadge (Avatar + Name)

Organisms (Organismos)
├── LoginForm (InputFields + Button)
├── UserCard (UserBadge + Actions)
└── Navigation (Logo + Menu + UserBadge)

Templates (Templates)
├── AuthLayout
├── DashboardLayout
└── PublicLayout

Pages (Páginas)
├── LoginPage
├── DashboardPage
└── UsersPage
```

---

## Atoms (Átomos)

> Componentes básicos e indivisíveis

### **Button**

```typescript
// components/ui/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        isLoading && 'btn-loading',
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <Spinner size={size} />}
      {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
    </button>
  )
}

// Uso:
<Button variant="primary" size="md" onClick={handleClick}>
  Salvar
</Button>

<Button
  variant="primary"
  leftIcon={<SaveIcon />}
  isLoading={isLoading}
>
  Salvar
</Button>
```

### **Input**

```typescript
// components/ui/Input/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({
  error,
  leftIcon,
  rightIcon,
  className,
  ...rest
}: InputProps) {
  return (
    <div className="input-wrapper">
      {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
      <input
        className={cn(
          'input',
          error && 'input-error',
          leftIcon && 'input-with-left-icon',
          rightIcon && 'input-with-right-icon',
          className
        )}
        {...rest}
      />
      {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
    </div>
  )
}

// Uso:
<Input
  placeholder="Email"
  leftIcon={<EmailIcon />}
  error={errors.email}
/>
```

### **Avatar**

```typescript
// components/ui/Avatar/Avatar.tsx
interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

export function Avatar({ src, alt, size = 'md', fallback }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const initials = fallback || alt.split(' ').map(n => n[0]).join('').toUpperCase()

  if (!src || imageError) {
    return (
      <div className={cn('avatar avatar-fallback', `avatar-${size}`)}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('avatar', `avatar-${size}`)}
      onError={() => setImageError(true)}
    />
  )
}

// Uso:
<Avatar src={user.avatar} alt={user.name} size="md" />
<Avatar alt="John Doe" fallback="JD" />
```

---

## Molecules (Moléculas)

> Combinação de 2+ átomos

### **InputField**

```typescript
// components/forms/InputField/InputField.tsx
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function InputField({
  label,
  error,
  hint,
  required,
  leftIcon,
  rightIcon,
  id,
  ...rest
}: InputFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="input-field">
      <label htmlFor={fieldId} className="input-field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>

      <Input
        id={fieldId}
        error={error}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />

      {hint && !error && (
        <span className="input-field-hint">{hint}</span>
      )}

      {error && (
        <span id={`${fieldId}-error`} className="input-field-error">
          {error}
        </span>
      )}
    </div>
  )
}

// Uso:
<InputField
  label="Email"
  type="email"
  required
  error={errors.email}
  hint="Seu email profissional"
/>
```

### **SearchBar**

```typescript
// components/shared/SearchBar/SearchBar.tsx
interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  isLoading?: boolean
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  isLoading
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
  }

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <Input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<SearchIcon />}
        rightIcon={isLoading && <Spinner />}
      />
      {onSearch && (
        <Button type="submit" variant="primary">
          Buscar
        </Button>
      )}
    </form>
  )
}

// Uso:
<SearchBar
  value={searchTerm}
  onChange={setSearchTerm}
  onSearch={handleSearch}
  isLoading={isSearching}
/>
```

### **UserBadge**

```typescript
// components/shared/UserBadge/UserBadge.tsx
interface UserBadgeProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  showEmail?: boolean
  onClick?: () => void
}

export function UserBadge({
  user,
  size = 'md',
  showEmail,
  onClick
}: UserBadgeProps) {
  return (
    <div
      className={cn('user-badge', `user-badge-${size}`, onClick && 'clickable')}
      onClick={onClick}
    >
      <Avatar
        src={user.avatar}
        alt={user.name}
        size={size}
      />
      <div className="user-badge-info">
        <span className="user-badge-name">{user.name}</span>
        {showEmail && (
          <span className="user-badge-email">{user.email}</span>
        )}
      </div>
    </div>
  )
}

// Uso:
<UserBadge user={currentUser} size="md" showEmail />
```

---

## Organisms (Organismos)

> Componentes complexos com lógica

### **LoginForm**

```typescript
// components/forms/LoginForm/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: (user: User) => void
  onError?: (error: Error) => void
}

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  })

  const { mutate: login, isLoading } = useLogin({
    onSuccess,
    onError
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
        leftIcon={<EmailIcon />}
      />

      <InputField
        label="Senha"
        type="password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        required
        leftIcon={<LockIcon />}
      />

      <Checkbox
        checked={formData.rememberMe}
        onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
        label="Lembrar-me"
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        className="w-full"
      >
        Entrar
      </Button>
    </form>
  )
}

// Uso:
<LoginForm
  onSuccess={user => navigate('/dashboard')}
  onError={error => toast.error(error.message)}
/>
```

### **UserCard**

```typescript
// components/cards/UserCard/UserCard.tsx
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  variant?: 'compact' | 'full'
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  variant = 'compact'
}: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={`user-card user-card-${variant}`}>
      <Card.Header>
        <UserBadge user={user} showEmail={variant === 'full'} />
        {variant === 'compact' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ver menos' : 'Ver mais'}
          </Button>
        )}
      </Card.Header>

      {(isExpanded || variant === 'full') && (
        <Card.Body>
          <div className="user-card-details">
            <div>
              <label>Telefone:</label>
              <span>{user.phone || 'N/A'}</span>
            </div>
            <div>
              <label>Empresa:</label>
              <span>{user.company || 'N/A'}</span>
            </div>
            <div>
              <label>Status:</label>
              <Badge variant={user.status}>{user.status}</Badge>
            </div>
          </div>
        </Card.Body>
      )}

      {(onEdit || onDelete) && (
        <Card.Footer>
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(user)}
              leftIcon={<EditIcon />}
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(user.id)}
              leftIcon={<DeleteIcon />}
            >
              Deletar
            </Button>
          )}
        </Card.Footer>
      )}
    </Card>
  )
}

// Uso:
<UserCard
  user={user}
  variant="full"
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

## Component Patterns

### **Compound Components**

```typescript
// components/ui/Card/Card.tsx
interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('card', className)}>{children}</div>
}

Card.Header = function CardHeader({ children, className }: CardProps) {
  return <div className={cn('card-header', className)}>{children}</div>
}

Card.Body = function CardBody({ children, className }: CardProps) {
  return <div className={cn('card-body', className)}>{children}</div>
}

Card.Footer = function CardFooter({ children, className }: CardProps) {
  return <div className={cn('card-footer', className)}>{children}</div>
}

// Uso:
<Card>
  <Card.Header>
    <h2>Título</h2>
  </Card.Header>
  <Card.Body>
    <p>Conteúdo</p>
  </Card.Body>
  <Card.Footer>
    <Button>Ação</Button>
  </Card.Footer>
</Card>
```

### **Render Props**

```typescript
// components/patterns/DataFetcher.tsx
interface DataFetcherProps<T> {
  url: string
  render: (data: T, isLoading: boolean, error: Error | null) => React.ReactNode
}

export function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [url])

  return <>{render(data as T, isLoading, error)}</>
}

// Uso:
<DataFetcher<User>
  url="/api/users/123"
  render={(user, isLoading, error) => {
    if (isLoading) return <Loading />
    if (error) return <Error message={error.message} />
    return <UserCard user={user} />
  }}
/>
```

### **Higher-Order Components (HOC)**

```typescript
// hocs/withAuth.tsx
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
      return <Loading />
    }

    if (!user) {
      return <Navigate to="/login" />
    }

    return <Component {...props} />
  }
}

// Uso:
const ProtectedDashboard = withAuth(Dashboard)

<Route path="/dashboard" element={<ProtectedDashboard />} />
```

### **Custom Hooks Pattern**

```typescript
// hooks/useToggle.ts
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}

// Uso:
function Modal() {
  const { value: isOpen, toggle, setTrue, setFalse } = useToggle(false)

  return (
    <>
      <Button onClick={setTrue}>Abrir</Button>
      <Dialog open={isOpen} onClose={setFalse}>
        <p>Conteúdo</p>
      </Dialog>
    </>
  )
}
```

---

## Composition

### **Component Composition**

```typescript
// ❌ MAU - Props para tudo
interface ModalProps {
  title: string
  content: string
  footer: string
  headerIcon?: React.ReactNode
  showCloseButton?: boolean
  // ... mais 10 props
}

// ✅ BOM - Composição
<Modal>
  <Modal.Header>
    <h2>Título</h2>
  </Modal.Header>
  <Modal.Body>
    <p>Conteúdo</p>
  </Modal.Body>
  <Modal.Footer>
    <Button>Cancelar</Button>
    <Button>Confirmar</Button>
  </Modal.Footer>
</Modal>
```

### **Children as Props**

```typescript
// components/layout/Container.tsx
interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function Container({
  children,
  size = 'lg',
  className
}: ContainerProps) {
  return (
    <div className={cn('container', `container-${size}`, className)}>
      {children}
    </div>
  )
}

// Uso:
<Container size="md">
  <h1>Título</h1>
  <p>Conteúdo</p>
</Container>
```

---

## Props Patterns

### **Optional Props com Default Values**

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`}>
      {children}
    </button>
  )
}
```

### **Discriminated Unions**

```typescript
type ButtonProps =
  | {
      variant: 'link'
      href: string
      onClick?: never
    }
  | {
      variant?: 'primary' | 'secondary'
      href?: never
      onClick: () => void
    }

export function Button(props: ButtonProps) {
  if (props.variant === 'link') {
    return <a href={props.href}>Link</a>
  }

  return (
    <button onClick={props.onClick}>
      Button
    </button>
  )
}

// Uso:
<Button variant="link" href="/about" /> // ✅
<Button onClick={() => {}} /> // ✅
<Button variant="link" onClick={() => {}} /> // ❌ Error
```

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── ui/                    # Átomos
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Avatar/
│   │   └── index.ts
│   │
│   ├── forms/                 # Moléculas de formulário
│   │   ├── InputField/
│   │   ├── SelectField/
│   │   └── index.ts
│   │
│   ├── cards/                 # Moléculas de cards
│   │   ├── UserCard/
│   │   ├── ProductCard/
│   │   └── index.ts
│   │
│   ├── layout/                # Organismos de layout
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── index.ts
│   │
│   └── shared/                # Componentes compartilhados
│       ├── SearchBar/
│       ├── UserBadge/
│       └── index.ts
│
├── pages/                     # Páginas
│   ├── Home/
│   ├── Dashboard/
│   └── Users/
│
└── hooks/                     # Custom hooks
    ├── useAuth.ts
    ├── useToggle.ts
    └── index.ts
```

---

## Best Practices

### **✅ DO:**

1. Componentes pequenos (< 250 linhas)
2. Single Responsibility
3. Props bem tipadas
4. Composição sobre configuração
5. Extrair lógica para hooks
6. Early returns para loading/error
7. Nomes descritivos

### **❌ DON'T:**

1. Componentes gigantes
2. Props drilling profundo (> 2 níveis)
3. Lógica de negócio no JSX
4. Mutação direta de props
5. Many useState (agrupar)
6. useEffect complexos

---

**Última atualização:** 2025-10-27
