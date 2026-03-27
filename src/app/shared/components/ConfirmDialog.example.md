# ConfirmDialog - Componente Moderno de Confirmação

Componente de modal de confirmação baseado nas melhores práticas de UX de 2025, inspirado em Linear, Vercel e Figma.

## ✨ Características

- **Design Moderno**: Interface limpa e minimalista com ícones expressivos
- **4 Variantes**: danger, warning, info, success
- **Backdrop com Blur**: Efeito de desfoque no fundo
- **Animações Suaves**: Transições e estados hover profissionais
- **Loading States**: Feedback visual durante processamento
- **Acessibilidade**: Suporte a teclado (ESC para cancelar)
- **Mobile-Friendly**: Responsivo e touch-friendly

## 📖 Como Usar

### Variante Danger (Padrão - Ações Destrutivas)
```tsx
import ConfirmDialog from "@/app/shared/components/ConfirmDialog";

// State
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [deleting, setDeleting] = useState(false);

// Handlers
const handleDelete = () => setDeleteDialogOpen(true);

const confirmDelete = async () => {
  setDeleting(true);
  try {
    await deleteItem();
    setDeleteDialogOpen(false);
  } finally {
    setDeleting(false);
  }
};

// JSX
<ConfirmDialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
  onConfirm={confirmDelete}
  title="Excluir Item?"
  description="Esta ação não pode ser desfeita. O item será permanentemente removido."
  confirmText="Excluir"
  variant="danger"
  loading={deleting}
/>
```

### Variante Warning (Ações Importantes)
```tsx
<ConfirmDialog
  open={warningDialogOpen}
  onClose={() => setWarningDialogOpen(false)}
  onConfirm={handleConfirm}
  title="Atenção!"
  description="Esta ação irá modificar configurações importantes. Deseja continuar?"
  confirmText="Sim, Continuar"
  variant="warning"
/>
```

### Variante Info (Informações)
```tsx
<ConfirmDialog
  open={infoDialogOpen}
  onClose={() => setInfoDialogOpen(false)}
  onConfirm={handleConfirm}
  title="Atualização Disponível"
  description="Uma nova versão está disponível. Deseja atualizar agora?"
  confirmText="Atualizar"
  cancelText="Mais Tarde"
  variant="info"
/>
```

### Variante Success (Confirmações Positivas)
```tsx
<ConfirmDialog
  open={successDialogOpen}
  onClose={() => setSuccessDialogOpen(false)}
  onConfirm={handleConfirm}
  title="Tudo Pronto!"
  description="Suas alterações foram salvas. Deseja compartilhar com a equipe?"
  confirmText="Compartilhar"
  variant="success"
/>
```

### Sem Ícone
```tsx
<ConfirmDialog
  open={open}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Confirmar Ação"
  description="Você tem certeza?"
  showIcon={false}
/>
```

## 🎨 Variantes e Cores

| Variante  | Cor Principal | Uso Recomendado |
|-----------|---------------|-----------------|
| `danger`  | Vermelho (#ef4444) | Exclusões, ações destrutivas |
| `warning` | Laranja (#f59e0b) | Ações importantes, avisos |
| `info`    | Azul (#3b82f6) | Informações, atualizações |
| `success` | Verde (#10b981) | Confirmações positivas |

## 📋 Props

```typescript
interface ConfirmDialogProps {
  open: boolean;              // Controla visibilidade
  onClose: () => void;        // Callback ao fechar/cancelar
  onConfirm: () => void;      // Callback ao confirmar
  title: string;              // Título do modal
  description: string;        // Descrição/mensagem
  confirmText?: string;       // Texto do botão confirmar (padrão: baseado na variante)
  cancelText?: string;        // Texto do botão cancelar (padrão: "Cancelar")
  variant?: ConfirmVariant;   // Tipo: 'danger' | 'warning' | 'info' | 'success'
  loading?: boolean;          // Estado de carregamento
  showIcon?: boolean;         // Mostrar ícone (padrão: true)
}
```

## 🎯 Melhores Práticas

### ✅ Quando Usar
- Ações irreversíveis (deletar, excluir)
- Operações com impacto significativo
- Confirmação de alterações críticas
- Avisos importantes antes de continuar

### ❌ Quando NÃO Usar
- Ações triviais e reversíveis
- Operações de baixo impacto
- Fluxos que já têm outras confirmações
- Casos onde o usuário pode "desfazer" facilmente

### 💡 Dicas de UX
1. **Seja Específico**: Use nomes de itens no description
2. **Evite Jargão**: Use linguagem clara e direta
3. **Destaque o Perigo**: Para ações destrutivas, seja explícito
4. **Loading States**: Sempre mostre feedback durante processamento
5. **Escape para Cancelar**: Os usuários esperam que ESC funcione

## 🔄 Comparação com Componentes Antigos

### Antes (confirm() nativo)
```tsx
const handleDelete = async () => {
  if (!confirm("Tem certeza?")) return;

  try {
    await deleteItem();
  } catch (error) {
    alert("Erro!");
  }
};
```

### Depois (ConfirmDialog)
```tsx
const [dialogOpen, setDialogOpen] = useState(false);
const [loading, setLoading] = useState(false);

const handleDelete = () => setDialogOpen(true);

const confirmDelete = async () => {
  setLoading(true);
  try {
    await deleteItem();
    setDialogOpen(false);
  } catch (error) {
    // Tratamento de erro
  } finally {
    setLoading(false);
  }
};

<ConfirmDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onConfirm={confirmDelete}
  title="Excluir Item?"
  description="Esta ação não pode ser desfeita."
  variant="danger"
  loading={loading}
/>
```

## 🎨 Design System

Este componente segue as melhores práticas dos principais design systems:

- **Linear**: Interface minimalista e foco na ação
- **Vercel**: Blur backdrop e animações suaves
- **Figma**: Ícones expressivos e hierarquia visual clara
- **Material Design 3**: Elevação e espaçamento consistentes

## 📱 Acessibilidade

- ✅ Suporte a navegação por teclado
- ✅ ESC fecha o modal
- ✅ Enter confirma (quando botão está em foco)
- ✅ Foco automático ao abrir
- ✅ Trap de foco dentro do modal
- ✅ Cores com contraste adequado (WCAG AA)

## 🚀 Exemplos no Código

Os seguintes locais já usam o novo componente:
- `/dashboard/kanban` - Exclusão de colunas e boards
- `/dashboard/kanban/components/CardModal` - Exclusão de anexos
- `/shared/components/DeleteDialog` - Modal de exclusão geral
