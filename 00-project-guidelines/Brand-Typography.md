# Tipografia - Dentrixa

Documentação oficial da tipografia e hierarquia de texto do CRM.

## Visão Geral

A fonte escolhida para representar a identidade visual da Dentrixa é a **Afacad**, uma sans-serif contemporânea, limpa e altamente versátil. Sua construção geométrica e bem equilibrada reflete com clareza os pilares da marca: tecnologia aplicada, eficiência na gestão e comunicação acessível.

Projetada para proporcionar uma leitura fluida e moderna, a Afacad funciona com excelência em todos os pontos de contato da marca — desde interfaces digitais, sistemas e aplicativos, até materiais institucionais, peças promocionais e apresentações corporativas.

## Família Tipográfica

### Afacad (Google Fonts)

**Fonte:** [Afacad](https://fonts.google.com/specimen/Afacad)
**Tipo:** Sans-serif
**Designer:** Fontes contemporâneas
**Licença:** Open Font License

### Pesos Utilizados

A identidade visual da Dentrixa utiliza três pesos da família Afacad:

#### Regular (400)
- **Uso principal:** Corpo de texto, parágrafos, descrições
- **Contextos:** Textos longos, conteúdo informativo, labels
- **Características:** Leitura confortável e fluida

#### Semi Bold (600)
- **Uso principal:** Subtítulos, destaque intermediário, navegação
- **Contextos:** Menus, botões secundários, categorias
- **Características:** Equilíbrio entre destaque e legibilidade

#### Bold (700)
- **Uso principal:** Títulos, headings, CTAs principais
- **Contextos:** Títulos de seções, botões primários, alertas
- **Características:** Forte impacto visual e hierarquia clara

## Caracteres

A fonte Afacad possui suporte completo para o alfabeto latino e numerais:

```
Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo
Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
0 1 2 3 4 5 6 7 8 9
, . ; ' ' " " / ?
```

## Hierarquia Tipográfica

### Títulos

```
H1: Bold (700) - 32-40px
H2: Bold (700) - 28-32px
H3: Semi Bold (600) - 24-28px
H4: Semi Bold (600) - 20-24px
H5: Semi Bold (600) - 18-20px
H6: Semi Bold (600) - 16-18px
```

### Corpo de Texto

```
Grande: Regular (400) - 18px
Normal: Regular (400) - 16px
Pequeno: Regular (400) - 14px
Extra Pequeno: Regular (400) - 12px
```

### Elementos de Interface

```
Botões Primários: Semi Bold (600) - 16px
Botões Secundários: Regular (400) - 16px
Labels de Input: Regular (400) - 14px
Placeholders: Regular (400) - 14px
Badges/Tags: Semi Bold (600) - 12-14px
Navegação: Semi Bold (600) - 16px
```

## Implementação Técnica

### Google Fonts

Adicione a importação no `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Afacad:wght@400;600;700&display=swap" rel="stylesheet">
```

### Tailwind CSS

Configuração no `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['Afacad', 'system-ui', 'Arial', 'sans-serif'],
  heading: ['Afacad', 'system-ui', 'Arial', 'sans-serif'],
},
fontWeight: {
  normal: '400',    // Regular
  semibold: '600',  // Semi Bold
  bold: '700',      // Bold
}
```

### Classes Utilitárias

Exemplos de uso no código:

```jsx
// Título principal
<h1 className="font-bold text-4xl text-grayscale-950">Título</h1>

// Subtítulo
<h2 className="font-semibold text-2xl text-grayscale-900">Subtítulo</h2>

// Corpo de texto
<p className="font-normal text-base text-grayscale-800">
  Conteúdo do parágrafo
</p>

// Botão primário
<button className="font-semibold text-base bg-accent text-grayscale-950">
  Ação Principal
</button>

// Label
<label className="font-normal text-sm text-grayscale-700">
  Nome do campo
</label>

// Badge
<span className="font-semibold text-xs bg-warm text-white">
  Pendente
</span>
```

## Diretrizes de Uso

### ✅ Boas Práticas

1. **Hierarquia Clara:** Sempre usar Bold para títulos principais e Semi Bold para subtítulos
2. **Legibilidade:** Manter corpo de texto em Regular (400) para melhor leitura
3. **Contraste:** Garantir contraste adequado entre texto e fundo (mínimo 4.5:1)
4. **Consistência:** Manter os pesos consistentes em contextos similares
5. **Espaçamento:** Usar line-height adequado (1.5 para corpo, 1.2 para títulos)
6. **Tamanhos Mínimos:** Nunca usar tamanho menor que 12px em interfaces digitais

### ❌ Evitar

1. Misturar múltiplos pesos em um mesmo elemento sem propósito
2. Usar Bold em textos longos (reduz legibilidade)
3. Textos muito pequenos em mobile (mínimo 14px para corpo)
4. Excesso de variações de tamanho na mesma tela
5. Espaçamento insuficiente entre linhas (line-height < 1.4)

## Acessibilidade

### Contraste de Cores

Sempre validar o contraste entre texto e fundo:

- **Normal (< 18px):** Mínimo 4.5:1
- **Grande (≥ 18px ou Bold ≥ 14px):** Mínimo 3:1

### Tamanhos Recomendados

- **Desktop:** Corpo de texto mínimo 16px
- **Mobile:** Corpo de texto mínimo 14px
- **Idosos/Baixa visão:** Considerar opção de aumentar até 18-20px

### Legibilidade

- **Line Height:** 1.5 para corpo de texto, 1.2-1.3 para títulos
- **Letter Spacing:** Padrão da fonte (não alterar sem necessidade)
- **Comprimento de Linha:** Máximo 75 caracteres para leitura ideal

## Responsividade

### Escalas de Texto

Ajustar tamanhos proporcionalmente para diferentes viewports:

```css
/* Mobile First */
h1 { font-size: 2rem; }     /* 32px */
h2 { font-size: 1.75rem; }  /* 28px */
body { font-size: 1rem; }   /* 16px */

/* Tablet (md) */
@media (min-width: 768px) {
  h1 { font-size: 2.25rem; } /* 36px */
  h2 { font-size: 2rem; }    /* 32px */
}

/* Desktop (lg) */
@media (min-width: 1024px) {
  h1 { font-size: 2.5rem; }  /* 40px */
  h2 { font-size: 2.25rem; } /* 36px */
}
```

## Performance

### Otimizações

1. **Preconnect:** Usar preconnect para Google Fonts
2. **Display Swap:** Usar `display=swap` para evitar FOIT
3. **Subsets:** Carregar apenas caracteres necessários (latin)
4. **Weights Específicos:** Carregar apenas os pesos utilizados (400, 600, 700)

### Exemplo Otimizado

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Afacad:wght@400;600;700&display=swap&subset=latin" rel="stylesheet">
```

## Fallbacks

Em caso de falha no carregamento da fonte principal:

```css
font-family: 'Afacad', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

## Referências

- **Fonte:** [Afacad no Google Fonts](https://fonts.google.com/specimen/Afacad)
- **Brand Book:** [Dentrixa - Tipografia](https://www.figma.com/slides/JsFgxjfeJzgDie721h6giW/Brand-Book---Dentrixa---PT-BR)
- **WCAG 2.1:** [Diretrizes de Contraste](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- **Atualizado em:** Outubro 2025
