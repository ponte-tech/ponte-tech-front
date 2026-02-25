# Paleta de Cores - Dentrixa

Documentação oficial da identidade visual e paleta de cores do CRM.

## Visão Geral

A paleta de cores do Dentrixa foi desenvolvida para transmitir inovação, conectividade e profissionalismo, refletindo a proposta de elevar o padrão de serviços odontológicos por meio da tecnologia.

## Cores Principais

### Ciano Principal (Accent Colors)
**Código:** `#68FCD6`

**Uso:** Cor institucional da marca, utilizada para:
- Elementos principais de interface
- CTAs (Call-to-Actions)
- Destaques e elementos interativos
- Representação da inovação e conectividade

**Significado:** Associada à inovação, conectividade e à proposta de elevar o padrão de serviços odontológicos através da tecnologia.

### Tons de Cinza Escuro (Grayscale)
**Código:** `#202031`

**Uso:** Base neutra da marca, utilizada para:
- Textos principais
- Fundos de seções
- Elementos de navegação
- Criação de hierarquia visual

**Significado:** Garantem sofisticação, contraste e excelente leitura em contextos digitais e físicos. Servem como fundo ideal para composições com cores mais vibrantes.

## Cores de Apoio

### Vermelho (Danger Accent)
**Código:** `#FF2D46`

**Uso:** Estados de alerta e atenção, utilizada para:
- Alertas e mensagens de erro
- Avisos importantes
- Elementos que requerem atenção imediata
- Ações destrutivas (deletar, remover)

### Amarelo (Warm Accent)
**Código:** `#EEA02B`

**Uso:** Estados de atenção temporários, utilizada para:
- Lembretes
- Avisos de prazos
- Status "em andamento"
- Notificações de atenção moderada

### Azul Alternativo (Alternative Accent)
**Código:** `#5218FF`

**Uso:** Variações visuais, utilizada para:
- Contextos diferenciados
- Campanhas especiais
- Elementos secundários de destaque
- Manter coerência com a identidade principal

## Implementação Técnica

### Tailwind CSS

As cores estão configuradas no arquivo `tailwind.config.js`:

```javascript
colors: {
  // Cor principal da marca
  accent: {
    DEFAULT: '#68FCD6',
    // Variações podem ser adicionadas conforme necessário
  },

  // Base neutra
  grayscale: {
    DEFAULT: '#202031',
    // Variações podem ser adicionadas conforme necessário
  },

  // Cores de estado
  danger: {
    DEFAULT: '#FF2D46',
    // Variações para hover, disabled, etc.
  },

  warm: {
    DEFAULT: '#EEA02B',
    // Variações podem ser adicionadas conforme necessário
  },

  alternative: {
    DEFAULT: '#5218FF',
    // Variações podem ser adicionadas conforme necessário
  },
}
```

### Classes Utilitárias

Exemplos de uso no código:

```jsx
// Texto com cor principal
<h1 className="text-accent">Título</h1>

// Fundo com cor principal
<div className="bg-accent">Conteúdo</div>

// Botão de alerta
<button className="bg-danger text-white">Deletar</button>

// Badge de aviso
<span className="bg-warm text-grayscale">Pendente</span>
```

## Diretrizes de Uso

### ✅ Boas Práticas

1. **Contraste:** Sempre garantir contraste adequado para acessibilidade (mínimo 4.5:1 para texto)
2. **Consistência:** Usar as cores de acordo com seu significado semântico
3. **Hierarquia:** Usar o ciano principal para elementos de maior importância
4. **Estados:** Respeitar as cores de estado (danger, warm) para suas respectivas funções

### ❌ Evitar

1. Usar vermelho (danger) para elementos que não representam alerta ou erro
2. Misturar cores de apoio sem propósito claro
3. Usar o ciano principal em excesso, perdendo seu impacto visual
4. Ignorar o contraste em favor da estética

## Acessibilidade

Todas as cores devem ser testadas para garantir conformidade com WCAG 2.1 nível AA:

- **Ciano Principal (#68FCD6):** Verificar contraste com texto escuro
- **Grayscale (#202031):** Excelente para texto em fundos claros
- **Cores de Apoio:** Sempre validar contraste com texto

### Ferramentas Recomendadas

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

## Referências

- Fonte: [Brand Book - Dentrixa](https://www.figma.com/slides/JsFgxjfeJzgDie721h6giW/Brand-Book---Dentrixa---PT-BR)
- Atualizado em: Outubro 2025
