# Práticas de UX para Tabelas

## Visão Geral

Este documento descreve as melhores práticas de UX implementadas nas tabelas do CRM, baseadas em padrões de mercado adotados por produtos como Notion, Linear, Salesforce, HubSpot e outros sistemas modernos.

## Índice

1. [Layout e Estrutura](#layout-e-estrutura)
2. [Visualização de Dados](#visualização-de-dados)
3. [Ações e Interações](#ações-e-interações)
4. [Paginação](#paginação)
5. [Estados e Feedback](#estados-e-feedback)
6. [Acessibilidade](#acessibilidade)

---

## Layout e Estrutura

### Full-Height Layout

As tabelas devem ocupar todo o espaço vertical disponível, com paginação sempre visível na parte inferior.

**Implementação:**
```tsx
<div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-0">
  {/* Table Container - Scrollable */}
  <div className="flex-1 overflow-auto">
    <table className="min-w-full divide-y divide-gray-200 h-full">
      <thead className="bg-gray-50 sticky top-0 z-10">
        {/* Headers */}
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {/* Rows */}
      </tbody>
    </table>
  </div>

  {/* Pagination - Always visible */}
  <div className="bg-white px-6 py-4 flex-shrink-0 border-t border-gray-200">
    {/* Pagination controls */}
  </div>
</div>
```

**Princípios:**
- `flex-1 flex flex-col` - Container ocupa espaço disponível e organiza filhos em coluna
- `overflow-auto` - Permite scroll apenas no corpo da tabela
- `sticky top-0 z-10` - Header fixo durante scroll
- `flex-shrink-0` - Paginação não encolhe, sempre visível

### Sticky Header

O cabeçalho da tabela deve permanecer visível durante o scroll.

```tsx
<thead className="bg-gray-50 sticky top-0 z-10">
```

**z-index:** 10 para ficar acima do conteúdo, mas abaixo de modais (z-40+)

---

## Visualização de Dados

### Score Badge com Progress Bar

Substitui badges simples por visualizações mais informativas com barra de progresso e ícones.

**Implementação:**
```tsx
export const LeadScoreBadge = ({ score }: { score: number }) => {
  const config = getScoreConfig(score);

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      {/* Progress Bar */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-semibold ${config.textColor}`}>
            {score}
          </span>
        </div>
        <div className={`h-1.5 rounded-full ${config.bgColor} overflow-hidden`}>
          <div
            className={`h-full ${config.barColor} transition-all duration-300 rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Icon */}
      <span className="text-base" title={config.label}>
        {config.icon}
      </span>
    </div>
  );
};
```

**Faixas de Score:**
- 0-25: ❄️ Frio (bg-error-500)
- 26-50: 🌤️ Morno (bg-warning-500)
- 51-75: 🔥 Quente (bg-orange-500)
- 76-100: ⭐ Muito Quente (bg-success-500)

**Benefícios:**
- ✅ Visualização imediata da qualidade do lead
- ✅ Barra de progresso mostra proporção visual
- ✅ Ícones facilitam reconhecimento rápido
- ✅ Animação suave nas transições

### Status Badge com Ícones

Badges de status devem ter ícones SVG para facilitar identificação visual rápida.

**Implementação:**
```tsx
const statusConfig: Record<LeadStatus, { label: string; className: string; icon: React.ReactNode }> = {
  Novo: {
    label: 'Novo',
    className: 'bg-accent-100 text-accent-700 border border-accent-200',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  // ... outros status
};

export const LeadStatusBadge = ({ status }: { status: LeadStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};
```

**Padrões de cor por status:**
- **Novo**: Accent (azul) - Neutro, requer atenção
- **Contatado**: Blue - Em progresso
- **Qualificado**: Success (verde) - Positivo
- **Desqualificado**: Gray - Inativo/Neutro
- **Convertido**: Purple - Sucesso especial

**Princípios:**
- Formato `rounded-full` (pills) ao invés de retângulos
- Ícone + texto para dupla codificação
- Border sutil para definição visual
- Cores consistentes com sistema de design

### Avatar com Gradiente

Exibir inicial do nome em avatar circular com gradiente.

```tsx
<div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
  <span className="text-sm font-semibold text-white">
    {name.charAt(0).toUpperCase()}
  </span>
</div>
```

**Benefícios:**
- Adiciona personalidade visual
- Facilita escaneamento rápido
- Consistente com design moderno

---

## Ações e Interações

### Dropdown Menu com Posicionamento Fixo

Menu de ações deve usar `position: fixed` para evitar ser cortado por `overflow-hidden`.

**Implementação:**
```tsx
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

// No botão de ações
<button
  onClick={(e) => {
    if (openMenuId === item.id) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
      setOpenMenuId(item.id);
    }
  }}
  className="p-1 rounded-full hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
>
  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
  </svg>
</button>

{/* Dropdown */}
{openMenuId === item.id && menuPosition && (
  <>
    <div className="fixed inset-0 z-40" onClick={() => { setOpenMenuId(null); setMenuPosition(null); }} />
    <div
      className="fixed z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
      style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
    >
      {/* Menu items */}
    </div>
  </>
)}
```

**Camadas de z-index:**
- `z-10`: Header da tabela (sticky)
- `z-40`: Overlay do dropdown (background escuro)
- `z-50`: Dropdown menu (conteúdo)
- `z-50+`: Modais e overlays globais

**Padrões de menu:**
1. **Ações primárias** (topo): Visualizar, Editar
2. **Divisor**: `<div className="border-t border-gray-100 my-1" />`
3. **Ações destrutivas** (fim): Excluir (text-error-600, hover:bg-error-50)

### Hover States

Linhas da tabela devem ter efeitos de hover suaves.

```tsx
<tr className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
  {/* Cells */}
  <td className="px-6 py-4">
    {/* Botão de ações visível apenas no hover */}
    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
      {/* ... */}
    </button>
  </td>
</tr>
```

**Princípios:**
- `group` na linha permite controlar hover de filhos
- `opacity-0 group-hover:opacity-100` - Ações aparecem no hover
- `transition-colors duration-150` - Transição suave
- `cursor-pointer` indica que a linha é clicável

### Click Handlers

Prevenir propagação de eventos quando necessário.

```tsx
<tr onClick={() => navigate(`/items/${item.id}`)}>
  <td>
    {/* Ações que não devem navegar */}
    <div onClick={(e) => e.stopPropagation()}>
      <button>Ações</button>
    </div>
  </td>
</tr>
```

---

## Paginação

### Paginação Moderna

Implementar paginação completa com navegação por páginas, controles de navegação e seletor de itens por página.

**Implementação:**
```tsx
<div className="bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200">
  {/* Left side - Info */}
  <div className="flex items-center gap-4">
    {pagination.total > 0 ? (
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{start}</span> a{' '}
        <span className="font-medium">{end}</span> de{' '}
        <span className="font-medium">{total}</span> items
      </div>
    ) : (
      <div className="text-sm text-gray-500">Nenhum item encontrado</div>
    )}

    {/* Items per page */}
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Por página:</label>
      <select
        value={limit}
        onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
        className="px-2 py-1 text-sm border border-gray-300 rounded-md"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
  </div>

  {/* Right side - Navigation */}
  <div className="flex items-center gap-1">
    {/* First page */}
    <button disabled={page === 1} className="p-2 rounded-md disabled:opacity-40">
      <svg>{/* First icon */}</svg>
    </button>

    {/* Previous page */}
    <button disabled={page === 1} className="p-2 rounded-md disabled:opacity-40">
      <svg>{/* Previous icon */}</svg>
    </button>

    {/* Page numbers */}
    <div className="flex items-center gap-1 mx-2">
      {pages.map((pageNum, index) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
        ) : (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-md ${
              pageNum === page
                ? 'bg-accent-500 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        )
      ))}
    </div>

    {/* Next page */}
    <button disabled={page >= totalPages} className="p-2 rounded-md disabled:opacity-40">
      <svg>{/* Next icon */}</svg>
    </button>

    {/* Last page */}
    <button disabled={page >= totalPages} className="p-2 rounded-md disabled:opacity-40">
      <svg>{/* Last icon */}</svg>
    </button>
  </div>
</div>
```

### Lógica de Páginas com Ellipsis

Para muitas páginas, usar ellipsis (...) para manter interface limpa.

```tsx
const getPaginationPages = (currentPage: number, totalPages: number): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    // Mostrar todas as páginas se <= 7
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Sempre mostrar primeira página
    pages.push(1);

    // Ellipsis se página atual > 3
    if (currentPage > 3) {
      pages.push('...');
    }

    // Páginas ao redor da atual
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Ellipsis se página atual < totalPages - 2
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Sempre mostrar última página
    pages.push(totalPages);
  }

  return pages;
};
```

**Exemplos:**
- Total: 3 páginas → `[1, 2, 3]`
- Total: 10, atual: 1 → `[1, 2, 3, ..., 10]`
- Total: 10, atual: 5 → `[1, ..., 4, 5, 6, ..., 10]`
- Total: 10, atual: 10 → `[1, ..., 8, 9, 10]`

### Estados dos Botões

Botões de navegação devem ter estados claros.

```tsx
<button
  disabled={page === 1}
  className="p-2 rounded-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:bg-gray-100 transition-colors"
>
  {/* Icon */}
</button>
```

**Estados:**
- **Normal**: hover:bg-gray-100
- **Active** (página atual): bg-accent-500 text-white shadow-sm
- **Disabled**: opacity-40, cursor-not-allowed, sem hover

### Mapeamento de Dados da API

Sempre mapear estrutura da API para formato consistente.

```tsx
const pagination = {
  total: data?.pagination?.total_items || 0,
  page: data?.pagination?.current_page || 1,
  totalPages: data?.pagination?.total_pages || 1,
};
```

**Motivo:** APIs podem retornar diferentes formatos (snake_case, camelCase), padronizar internamente.

---

## Estados e Feedback

### Loading State

Exibir spinner centralizado durante carregamento inicial.

```tsx
if (isLoading) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-accent-500"></div>
      </div>
    </div>
  );
}
```

### Error State

Exibir mensagem de erro clara com opção de retry.

```tsx
if (error) {
  return (
    <div className="p-6">
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <p className="text-sm text-error-700">Erro ao carregar dados. Tente novamente.</p>
      </div>
    </div>
  );
}
```

### Empty State

Estado vazio com key única para evitar warnings.

```tsx
{items.length === 0 ? (
  <tr key="empty-state">
    <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
      Nenhum item encontrado
    </td>
  </tr>
) : (
  items.map(item => <Row key={item.id} {...item} />)
)}
```

### Modal de Confirmação

Para ações destrutivas, usar modal de confirmação.

```tsx
{deleteModalOpen && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={closeModal} />

      {/* Modal */}
      <div className="inline-block align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div className="sm:flex sm:items-start">
            {/* Icon warning */}
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-error-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Excluir Item</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja excluir <strong>{itemName}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-error-600 text-base font-medium text-white hover:bg-error-700 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
          <button
            onClick={closeModal}
            disabled={isDeleting}
            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

## Acessibilidade

### ARIA Labels

Adicionar labels descritivos para botões sem texto.

```tsx
<button aria-label="Primeira página" title="Primeira página">
  <svg>{/* Icon */}</svg>
</button>
```

### Keyboard Navigation

Garantir que todos os controles sejam acessíveis via teclado.

```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
  Ação
</button>
```

### Focus States

Manter estados de foco visíveis.

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2">
  Ação
</button>
```

### Títulos Descritivos

Usar atributo `title` para fornecer informações adicionais.

```tsx
<span className="text-base" title="Lead muito quente - alta probabilidade de conversão">
  ⭐
</span>
```

---

## Checklist de Implementação

Use este checklist ao implementar novas tabelas:

### Layout
- [ ] Full-height layout com `flex-1 flex flex-col`
- [ ] Header sticky com `sticky top-0 z-10`
- [ ] Overflow apenas no corpo da tabela
- [ ] Paginação sempre visível com `flex-shrink-0`

### Visualização
- [ ] Score/Progress badges com ícones e cores
- [ ] Status badges com ícones SVG
- [ ] Avatars com gradiente para pessoas
- [ ] Hover states suaves nas linhas

### Ações
- [ ] Dropdown com posicionamento fixo
- [ ] z-index correto (overlay: 40, menu: 50)
- [ ] Ações aparecem no hover da linha
- [ ] Modal de confirmação para ações destrutivas

### Paginação
- [ ] Info de range (Mostrando X a Y de Z)
- [ ] Seletor de itens por página (10, 25, 50, 100)
- [ ] Navegação: Primeira, Anterior, Páginas, Próxima, Última
- [ ] Ellipsis para muitas páginas
- [ ] Botões desabilitados quando apropriado
- [ ] Mapeamento correto dos dados da API

### Estados
- [ ] Loading state com spinner
- [ ] Error state com mensagem clara
- [ ] Empty state com texto apropriado
- [ ] Keys únicas em todos os elementos de lista

### Acessibilidade
- [ ] ARIA labels em botões sem texto
- [ ] Títulos descritivos (title attribute)
- [ ] Focus states visíveis
- [ ] Keyboard navigation funcional

---

## Referências

### Produtos inspiradores
- **Notion**: Tabelas com hover states elegantes e paginação limpa
- **Linear**: UX minimalista com ações contextual no hover
- **Salesforce**: Paginação robusta com muitas opções
- **HubSpot**: Badges informativos com cores e ícones
- **Airtable**: Visualização de dados rica

### Recursos
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Heroicons](https://heroicons.com/) - Ícones SVG usados
- [React Query](https://tanstack.com/query/latest) - Data fetching

---

## Exemplo Completo

Veja a implementação de referência em:
- **Arquivo**: `src/modules/leads/pages/LeadsListPage.tsx`
- **Componentes**:
  - `src/modules/leads/components/LeadScoreBadge.tsx`
  - `src/modules/leads/components/LeadStatusBadge.tsx`

---

**Última atualização**: 2025-10-28
**Autor**: Equipe de Desenvolvimento Dentrixa
