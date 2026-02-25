# Modern Page Design Pattern

## Visão Geral

Este documento define o padrão moderno de design para todas as páginas do CRM Frontend. Este padrão foi estabelecido através da evolução das páginas LeadDetailPage e LeadImportPage e deve ser seguido para todas as novas páginas e na modernização de páginas existentes.

## Objetivo

Garantir uma experiência visual consistente, moderna e profissional em toda a aplicação, com foco em:
- **Hierarquia Visual Clara**: Uso de gradientes, sombras e espaçamento para criar profundidade
- **Design Moderno**: Uso de bordas arredondadas (rounded-xl), gradientes suaves e transições suaves
- **Consistência**: Padrões repetíveis que criam familiaridade para o usuário
- **Responsividade**: Layouts que funcionam bem em diferentes tamanhos de tela
- **Acessibilidade**: Contraste adequado e elementos interativos claramente identificáveis

## Estrutura Base da Página

Toda página deve seguir esta estrutura fundamental:

```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
  {/* 1. Header Moderno */}
  <div className="bg-white border-b border-gray-200 shadow-sm">
    {/* Header Content */}
  </div>

  {/* 2. Main Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page Content */}
  </div>
</div>
```

### 1. Background da Página
```tsx
className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50"
```

**Características:**
- `min-h-screen`: Garante que a página ocupe no mínimo a altura da viewport
- `bg-gradient-to-br`: Gradiente diagonal do canto superior esquerdo para inferior direito
- `from-gray-50 to-gray-100/50`: Gradiente suave de cinza claro com transparência

**Por quê?**
- Cria profundidade visual sem ser intrusivo
- Background moderno e profissional
- A transparência (`/50`) cria um efeito sutil

---

## Header Moderno

O header é a primeira impressão da página e deve seguir este padrão:

```tsx
<div className="bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* 1. Breadcrumb Navigation */}
    <div className="py-4">
      <button
        onClick={() => navigate('/previous-page')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 19l-7-7 7-7" />
        </svg>
        {t('navigation.back')}
      </button>
    </div>

    {/* 2. Header Content */}
    <div className="py-6">
      <div className="flex items-center gap-4 mb-4">
        {/* Icon with Gradient */}
        <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor"
               viewBox="0 0 24 24">
            {/* Icon path */}
          </svg>
        </div>

        {/* Title and Description */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {t('page.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('page.subtitle')}</p>
        </div>
      </div>
    </div>

  </div>
</div>
```

### Elementos do Header

#### 1. Breadcrumb Navigation
```tsx
<button className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
  Texto
</button>
```

**Características:**
- `inline-flex items-center gap-2`: Alinhamento flexível com espaçamento de 8px
- `text-sm`: Texto menor (14px) para breadcrumb
- `text-gray-600 hover:text-gray-900`: Hierarquia visual através da cor
- `group`: Permite animar o ícone quando hover no botão inteiro
- `transition-transform group-hover:-translate-x-0.5`: Ícone se move 2px para esquerda no hover

**Por quê?**
- Feedback visual imediato ao usuário
- Animação sutil e profissional
- Fácil identificação da ação de voltar

#### 2. Header Icon com Gradiente
```tsx
<div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg">
  <svg className="w-8 h-8 text-white" />
</div>
```

**Características:**
- `p-3`: Padding de 12px em todos os lados
- `bg-gradient-to-br`: Gradiente diagonal
- `from-accent-500 to-accent-600`: Gradiente da cor de destaque
- `rounded-xl`: Bordas arredondadas de 12px (moderno)
- `shadow-lg`: Sombra grande para profundidade
- Ícone `w-8 h-8` (32x32px) em branco

**Por quê?**
- Cria um ponto focal visual imediato
- O gradiente adiciona profundidade ao ícone
- Sombra cria elevação e importância
- `rounded-xl` é mais moderno que `rounded-lg`

#### 3. Title & Subtitle
```tsx
<div>
  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
    {t('page.title')}
  </h1>
  <p className="text-gray-600 mt-1">{t('page.subtitle')}</p>
</div>
```

**Características:**
- `text-2xl lg:text-3xl`: Título responsivo (24px mobile, 30px desktop)
- `font-bold`: Peso da fonte bold (700)
- `text-gray-900`: Cor escura para contraste máximo
- Subtítulo em `text-gray-600` para hierarquia visual
- `mt-1`: Margem top pequena (4px) entre título e subtítulo

**Por quê?**
- Títulos responsivos melhoram leitura em mobile
- Hierarquia clara entre título e descrição
- Cores consistentes com o sistema de design

---

## Cards Modernos

Cards são os blocos de construção principais do conteúdo. Todos os cards devem seguir este padrão:

### Card Básico

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  {/* Card Header */}
  <div className="px-6 py-4 bg-gradient-to-r from-accent-50 to-alternative-50 border-b border-gray-200">
    <div className="flex items-center gap-3">
      {/* Numbered Badge (opcional) */}
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {t('section.title')}
        </h2>
        <p className="text-sm text-gray-600">
          {t('section.description')}
        </p>
      </div>
    </div>
  </div>

  {/* Card Content */}
  <div className="p-6">
    {/* Content aqui */}
  </div>
</div>
```

### Elementos do Card

#### 1. Card Container
```tsx
className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
```

**Características:**
- `bg-white`: Fundo branco para contraste com background da página
- `rounded-xl`: Bordas arredondadas de 12px (mais moderno que `rounded-lg`)
- `shadow-sm`: Sombra pequena para elevação sutil
- `border border-gray-200`: Borda sutil de 1px
- `overflow-hidden`: Garante que conteúdo respeite as bordas arredondadas

**Por quê?**
- `rounded-xl` (12px) é mais moderno que `rounded-lg` (8px)
- Sombra sutil cria profundidade sem ser excessiva
- Border adiciona definição ao card

#### 2. Card Header com Gradiente
```tsx
className="px-6 py-4 bg-gradient-to-r from-accent-50 to-alternative-50 border-b border-gray-200"
```

**Características:**
- `px-6 py-4`: Padding horizontal 24px, vertical 16px
- `bg-gradient-to-r`: Gradiente horizontal da esquerda para direita
- `from-accent-50 to-alternative-50`: Gradiente entre duas cores de destaque claras
- `border-b border-gray-200`: Borda inferior para separar header do conteúdo

**Variações de Cor:**
```tsx
// Accent (azul)
from-accent-50 to-accent-100

// Alternative (roxo)
from-alternative-50 to-alternative-100

// Success (verde)
from-success-50 to-success-100

// Warm (laranja)
from-warm-50 to-warm-100

// Combinação (mais criativo)
from-accent-50 to-alternative-50
```

**Por quê?**
- Gradiente horizontal é mais sutil que vertical
- Cores claras (-50 e -100) não competem com o conteúdo
- Cria identidade visual para diferentes tipos de seções

#### 3. Numbered Badge (para sequências)
```tsx
<div className="p-2 bg-white rounded-lg shadow-sm">
  <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
    <span className="text-white text-xs font-bold">1</span>
  </div>
</div>
```

**Características:**
- Container branco com `rounded-lg` e `shadow-sm`
- Badge circular (`rounded-full`) com gradiente
- Número em branco, bold, tamanho xs (12px)

**Variação com Gradiente:**
```tsx
<span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-accent-600 to-accent-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
  1
</span>
```

**Por quê?**
- Badges numerados ajudam a guiar o usuário em processos
- Destaque visual para sequência de passos
- Gradiente adiciona profundidade ao badge

---

## Sistema de Cores

### Escala de Cinzas (Gray)
**IMPORTANTE**: Use sempre `gray` ao invés de `grayscale` para consistência.

```tsx
// Backgrounds
bg-gray-50   // #F9FAFB - Background mais claro
bg-gray-100  // #F3F4F6 - Background claro
bg-gray-200  // #E5E7EB - Borders, divisores

// Text
text-gray-500  // #6B7280 - Texto secundário claro
text-gray-600  // #4B5563 - Texto secundário
text-gray-700  // #374151 - Texto normal
text-gray-900  // #111827 - Texto principal, títulos

// Borders
border-gray-200  // #E5E7EB - Border padrão
border-gray-300  // #D1D5DB - Border mais forte
```

### Cores de Destaque

#### Accent (Azul - Cor principal)
```tsx
// Backgrounds claros para headers
bg-accent-50   // Muito claro
bg-accent-100  // Claro

// Elementos interativos
bg-accent-500  // Cor média (ícones)
bg-accent-600  // Cor padrão (botões)
bg-accent-700  // Cor hover

// Text e borders
text-accent-600
border-accent-200
```

#### Alternative (Roxo - Cor secundária)
```tsx
bg-alternative-50
bg-alternative-600
text-alternative-600
```

#### Success (Verde - Sucesso, confirmações)
```tsx
bg-success-50
bg-success-600
text-success-600
border-success-200
```

#### Warm (Laranja - Avisos, atenção)
```tsx
bg-warm-50
bg-warm-600
text-warm-600
border-warm-200
```

#### Error (Vermelho - Erros, exclusões)
```tsx
bg-error-50
bg-error-600
text-error-600
border-error-200
```

### Uso de Gradientes

#### Background de Página
```tsx
bg-gradient-to-br from-gray-50 to-gray-100/50
```

#### Headers de Cards
```tsx
// Uma cor
bg-gradient-to-r from-accent-50 to-accent-100

// Duas cores (mais criativo)
bg-gradient-to-r from-accent-50 to-alternative-50
bg-gradient-to-r from-success-50 to-success-100
```

#### Ícones e Badges
```tsx
bg-gradient-to-br from-accent-500 to-accent-600
bg-gradient-to-br from-accent-600 to-accent-700
```

---

## Botões

### Botão Primary
```tsx
<button className="px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
  <svg className="w-5 h-5" />
  {t('button.label')}
</button>
```

**Características:**
- `px-6 py-3`: Padding adequado (24px horizontal, 12px vertical)
- `bg-accent-600`: Cor de destaque
- `text-white`: Texto branco para contraste
- `rounded-xl`: Bordas modernas de 12px
- `hover:bg-accent-700`: Cor mais escura no hover
- `transition-all`: Transição suave de todas as propriedades
- `font-semibold`: Peso semi-bold (600)
- `shadow-md hover:shadow-lg`: Sombra aumenta no hover
- `disabled:opacity-50 disabled:cursor-not-allowed`: Estados desabilitados

### Botão Secondary
```tsx
<button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold">
  {t('button.cancel')}
</button>
```

**Características:**
- `bg-white`: Background branco
- `border-2 border-gray-300`: Border mais grossa (2px)
- `text-gray-700`: Texto em cinza escuro
- `hover:bg-gray-50 hover:border-gray-400`: Mudanças sutis no hover

### Botão Success
```tsx
<button className="px-6 py-3 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-all font-semibold shadow-md hover:shadow-lg">
  <svg className="w-5 h-5" />
  {t('button.confirm')}
</button>
```

### Botão Error/Danger
```tsx
<button className="px-6 py-3 bg-error-600 text-white rounded-xl hover:bg-error-700 transition-all font-semibold shadow-md hover:shadow-lg">
  <svg className="w-5 h-5" />
  {t('button.delete')}
</button>
```

### Botão Loading
```tsx
<button disabled className="px-6 py-3 bg-accent-600 text-white rounded-xl opacity-50 cursor-not-allowed">
  <svg className="animate-spin w-5 h-5" />
  {t('button.loading')}
</button>
```

---

## Tabelas Modernas

### Container da Tabela
```tsx
<div className="overflow-x-auto -mx-6">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

**Características:**
- `overflow-x-auto`: Scroll horizontal em telas pequenas
- `-mx-6`: Margem negativa para expandir além do padding do card
- `min-w-full`: Tabela ocupa largura mínima total

### Table Header
```tsx
<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
      {t('table.header')}
    </th>
  </tr>
</thead>
```

**Características:**
- `bg-gradient-to-r from-gray-50 to-gray-100`: Background com gradiente sutil
- `px-6 py-3`: Padding adequado nas células
- `text-xs font-bold uppercase tracking-wider`: Estilo de header moderno
- `border-b-2 border-gray-200`: Borda inferior mais grossa

### Table Body
```tsx
<tbody className="bg-white divide-y divide-gray-100">
  <tr className="hover:bg-accent-50/30 transition-colors">
    <td className="px-6 py-3 text-sm text-gray-900">
      {data}
    </td>
  </tr>
</tbody>
```

**Características:**
- `divide-y divide-gray-100`: Divisor entre linhas
- `hover:bg-accent-50/30`: Background sutil no hover (com transparência)
- `transition-colors`: Transição suave da cor de fundo

---

## Formulários

### Input Text
```tsx
<input
  type="text"
  className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
  placeholder={t('input.placeholder')}
/>
```

**Características:**
- `w-full`: Largura total do container
- `px-4 py-2.5`: Padding interno adequado
- `border-2`: Borda de 2px (mais visível)
- `rounded-xl`: Bordas arredondadas modernas
- `focus:border-accent-500`: Borda muda de cor no focus
- `focus:ring-2 focus:ring-accent-500/20`: Anel de foco sutil

### Textarea
```tsx
<textarea
  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all resize-none"
  rows={4}
  placeholder={t('textarea.placeholder')}
/>
```

### Select
```tsx
<select className="w-full px-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all">
  <option value="">{t('select.placeholder')}</option>
  <option value="1">{t('select.option1')}</option>
</select>
```

---

## Scrollbar Customizada

Adicione ao final do componente para scrollbars modernas:

```tsx
<style>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }
`}</style>
```

E use a classe `custom-scrollbar` em elementos com overflow:

```tsx
<div className="overflow-y-auto max-h-40 custom-scrollbar">
  {/* Conteúdo com scroll */}
</div>
```

---

## Animações e Transições

### Transições Básicas
```tsx
transition-all        // Todas as propriedades
transition-colors     // Apenas cores
transition-transform  // Apenas transformações
transition-opacity    // Apenas opacidade
```

**Duração:**
```tsx
duration-200  // 200ms (padrão para interações rápidas)
duration-300  // 300ms (padrão para transições médias)
duration-500  // 500ms (para animações mais longas)
```

### Animações de Entrada
```tsx
animate-in fade-in slide-in-from-top-4 duration-300
```

**Variações:**
```tsx
fade-in                    // Fade in simples
slide-in-from-top-4       // Desliza de cima (16px)
slide-in-from-bottom-4    // Desliza de baixo
scale-in-95               // Escala de 95% para 100%
```

### Hover Effects

#### Sombras
```tsx
shadow-sm hover:shadow-md     // Elevação sutil
shadow-md hover:shadow-lg     // Elevação média
shadow-lg hover:shadow-xl     // Elevação forte
```

#### Transformações
```tsx
hover:-translate-y-0.5        // Move 2px para cima
hover:scale-[1.02]            // Aumenta 2%
group-hover:-translate-x-0.5  // Move quando hover no grupo
```

#### Cores
```tsx
hover:bg-gray-50              // Muda background
hover:text-gray-900           // Muda texto
hover:border-gray-400         // Muda border
```

---

## Espaçamento

### Container Principal
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
```

**Características:**
- `max-w-7xl`: Largura máxima de 1280px
- `mx-auto`: Centraliza horizontalmente
- `px-4 sm:px-6 lg:px-8`: Padding horizontal responsivo
- `py-8`: Padding vertical de 32px

### Grid Layouts
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* 1 coluna em mobile, 3 em desktop */}
</div>
```

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* 1 coluna em mobile, 2 em desktop */}
</div>
```

### Espaçamento entre Elementos
```tsx
space-y-4   // 16px entre elementos verticais
space-y-6   // 24px entre elementos verticais
gap-4       // 16px em grids/flex
gap-6       // 24px em grids/flex
```

---

## Responsividade

### Breakpoints Tailwind
```
sm:  640px  (tablets pequenos)
md:  768px  (tablets)
lg:  1024px (laptops)
xl:  1280px (desktops)
2xl: 1536px (desktops grandes)
```

### Padrões Responsivos

#### Texto
```tsx
text-2xl lg:text-3xl          // 24px mobile, 30px desktop
text-base lg:text-lg          // 16px mobile, 18px desktop
```

#### Padding
```tsx
px-4 sm:px-6 lg:px-8          // Padding horizontal progressivo
py-4 lg:py-6                  // Padding vertical progressivo
```

#### Grid
```tsx
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
// 1 coluna mobile, 2 tablet, 3 desktop
```

#### Flex
```tsx
flex-col lg:flex-row          // Vertical mobile, horizontal desktop
```

---

## Mensagens de Feedback

### Success Message
```tsx
<div className="bg-white border-2 border-success-500 rounded-xl shadow-md overflow-hidden">
  <div className="bg-gradient-to-r from-success-50 to-success-100 px-6 py-4 border-b border-success-200">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-10 h-10 bg-success-600 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-success-900">
        {t('message.success')}
      </h3>
    </div>
  </div>
  <div className="p-6">
    <p className="text-gray-700">{t('message.description')}</p>
  </div>
</div>
```

### Warning Message
```tsx
<div className="p-4 bg-warm-50 border border-warm-200 rounded-xl">
  <p className="text-sm font-semibold text-warm-900 mb-3 flex items-center gap-2">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    {t('message.warning')}
  </p>
  <p className="text-sm text-warm-800">{t('message.description')}</p>
</div>
```

### Error Message
```tsx
<div className="p-4 bg-error-50 border border-error-200 rounded-xl">
  <p className="text-sm font-semibold text-error-900 mb-2 flex items-center gap-2">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
    {t('message.error')}
  </p>
  <p className="text-sm text-error-800">{t('message.description')}</p>
</div>
```

---

## Sticky Elements

### Sidebar Sticky
```tsx
<div className="sticky top-6">
  {/* Conteúdo que fica fixo ao fazer scroll */}
</div>
```

**Características:**
- `sticky`: Posicionamento sticky (CSS position: sticky)
- `top-6`: Distância do topo quando fixo (24px)

---

## Badges e Tags

### Badge Simples
```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-100 text-accent-800">
  {t('badge.label')}
</span>
```

### Badge com Ícone
```tsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-success-100 text-success-800">
  <svg className="w-3 h-3" />
  {t('badge.label')}
</span>
```

### Badge com Gradiente
```tsx
<span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-br from-accent-100 to-accent-200 text-accent-800 rounded-lg font-medium text-xs border border-accent-300 shadow-sm">
  {t('badge.label')}
</span>
```

---

## Lista de Instruções

Quando precisar criar uma lista numerada de instruções/passos:

```tsx
<ol className="space-y-3">
  <li className="flex gap-3">
    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-accent-600 to-accent-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
      1
    </span>
    <span className="text-sm text-gray-700 leading-7 font-medium">
      {t('instructions.step1')}
    </span>
  </li>
  <li className="flex gap-3">
    <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-accent-600 to-accent-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
      2
    </span>
    <span className="text-sm text-gray-700 leading-7 font-medium">
      {t('instructions.step2')}
    </span>
  </li>
</ol>
```

---

## Empty States

Quando não há conteúdo para mostrar:

```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* Icon */}
    </svg>
  </div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    {t('emptyState.title')}
  </h3>
  <p className="text-sm text-gray-600 text-center max-w-md">
    {t('emptyState.description')}
  </p>
  <button className="mt-6 px-6 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-all font-semibold shadow-md hover:shadow-lg">
    {t('emptyState.action')}
  </button>
</div>
```

---

## Loading States

### Skeleton Loader
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
</div>
```

### Spinner
```tsx
<div className="flex items-center justify-center p-8">
  <svg className="animate-spin h-8 w-8 text-accent-600" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>
```

---

## Checklist de Implementação

Ao criar uma nova página, siga este checklist:

### ✅ Estrutura
- [ ] Background da página usa `bg-gradient-to-br from-gray-50 to-gray-100/50`
- [ ] Header moderno com breadcrumb e ícone com gradiente
- [ ] Content container com `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### ✅ Cards
- [ ] Todos os cards usam `rounded-xl` (não `rounded-lg`)
- [ ] Headers dos cards têm gradiente de fundo
- [ ] Cards têm `border border-gray-200` e `shadow-sm`

### ✅ Cores
- [ ] Usa `gray` ao invés de `grayscale`
- [ ] Gradientes seguem o padrão `from-{color}-50 to-{color}-100`
- [ ] Ícones principais usam `from-accent-500 to-accent-600`

### ✅ Botões
- [ ] Botões primários usam `rounded-xl`, `shadow-md`, `hover:shadow-lg`
- [ ] Botões têm `transition-all` para transições suaves
- [ ] Estados disabled implementados

### ✅ Tabelas
- [ ] Header com `bg-gradient-to-r from-gray-50 to-gray-100`
- [ ] Hover nas linhas com `hover:bg-accent-50/30 transition-colors`
- [ ] Overflow horizontal com `-mx-6` e `overflow-x-auto`

### ✅ Responsividade
- [ ] Títulos responsivos (`text-2xl lg:text-3xl`)
- [ ] Padding responsivo (`px-4 sm:px-6 lg:px-8`)
- [ ] Grid responsivo quando aplicável

### ✅ Acessibilidade
- [ ] Contraste adequado em todos os textos
- [ ] Botões têm estados focus visíveis
- [ ] Textos alternativos em ícones importantes

### ✅ Performance
- [ ] Scrollbar customizada quando necessário
- [ ] Animações usam `transition-all` ou específicas
- [ ] Loading states implementados

---

## Do's and Don'ts

### ✅ DO

1. **Use `rounded-xl` para elementos modernos**
   ```tsx
   <div className="rounded-xl" />
   ```

2. **Use gradientes sutis em headers**
   ```tsx
   <div className="bg-gradient-to-r from-accent-50 to-alternative-50" />
   ```

3. **Use sombras com hover para feedback**
   ```tsx
   <button className="shadow-md hover:shadow-lg" />
   ```

4. **Use `transition-all` para transições suaves**
   ```tsx
   <button className="transition-all hover:bg-accent-700" />
   ```

5. **Use espaçamento consistente**
   ```tsx
   <div className="space-y-6" />
   ```

6. **Use `gray` ao invés de `grayscale`**
   ```tsx
   <p className="text-gray-600" />
   ```

### ❌ DON'T

1. **Não use `rounded-lg` quando `rounded-xl` é mais apropriado**
   ```tsx
   // ❌ Evite
   <div className="rounded-lg" />

   // ✅ Prefira
   <div className="rounded-xl" />
   ```

2. **Não use cores sem gradiente em headers de cards**
   ```tsx
   // ❌ Evite
   <div className="bg-gray-100" />

   // ✅ Prefira
   <div className="bg-gradient-to-r from-gray-50 to-gray-100" />
   ```

3. **Não esqueça estados hover**
   ```tsx
   // ❌ Evite
   <button className="bg-accent-600" />

   // ✅ Prefira
   <button className="bg-accent-600 hover:bg-accent-700 transition-all" />
   ```

4. **Não use sombras muito fortes**
   ```tsx
   // ❌ Evite
   <div className="shadow-2xl" />

   // ✅ Prefira
   <div className="shadow-sm" /> ou <div className="shadow-md" />
   ```

5. **Não misture `grayscale` com `gray`**
   ```tsx
   // ❌ Evite
   <div className="bg-grayscale-50 text-gray-600" />

   // ✅ Prefira
   <div className="bg-gray-50 text-gray-600" />
   ```

---

## Exemplos Completos

### Exemplo 1: LeadImportPage Header

```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
  {/* Modern Header */}
  <div className="bg-white border-b border-gray-200 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="py-4">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('leads.importPage.backToList')}
        </button>
      </div>

      {/* Header Content */}
      <div className="py-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('leads.importPage.title')}</h1>
            <p className="text-gray-600 mt-1">{t('leads.importPage.subtitle')}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Exemplo 2: Card de Upload

```tsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <div className="px-6 py-4 bg-gradient-to-r from-accent-50 to-alternative-50 border-b border-gray-200">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{t('leads.importPage.uploadSection.title')}</h2>
        <p className="text-sm text-gray-600">{t('leads.importPage.uploadSection.description')}</p>
      </div>
    </div>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Exemplo 3: Tabela com Preview

```tsx
<div className="overflow-x-auto -mx-6">
  <table className="min-w-full">
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
          Nome
        </th>
        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
          Email
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-100">
      <tr className="hover:bg-accent-50/30 transition-colors">
        <td className="px-6 py-3 text-sm text-gray-900">João Silva</td>
        <td className="px-6 py-3 text-sm text-gray-900">joao@example.com</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Referências

### Páginas Implementadas com este Padrão
- `src/modules/leads/pages/LeadDetailPage.tsx` - Página de detalhes do lead
- `src/modules/leads/pages/LeadImportPage.tsx` - Página de importação de leads

### Documentação Relacionada
- `Brand-Colors.md` - Sistema de cores da marca
- `Components-Architecture.md` - Arquitetura de componentes
- `Table-UX-Practices.md` - Práticas de UX para tabelas

---

## Conclusão

Este padrão foi desenvolvido para criar uma experiência visual moderna, consistente e profissional em toda a aplicação. Ao seguir essas diretrizes, garantimos que:

1. **Todas as páginas têm a mesma identidade visual**
2. **Usuários entendem intuitivamente como navegar**
3. **O design escala facilmente para novas funcionalidades**
4. **A manutenção do código é simplificada**
5. **A experiência do usuário é sempre excepcional**

**Lembre-se**: Consistência é mais importante que perfeição. É melhor seguir um padrão consistente em toda a aplicação do que ter cada página com seu próprio estilo "perfeito".

---

**Última atualização**: Outubro 2025
**Versão**: 1.0
**Autores**: Time de Frontend do CRM
