# 📥 Importação de Cards do Jira

## Como usar:

### 1. Criar arquivos de texto para cada card

Dentro das pastas `parainiciar/` ou `emandamento/`, crie arquivos `.txt` com o seguinte formato:

**Exemplo: `parainiciar/card1.txt`**
```
Título: Implementar login
Responsável: Rafael
Descrição: Criar tela de login com autenticação JWT
```

**Exemplo: `emandamento/card2.txt`**
```
Título: Corrigir bug no dashboard
Responsável: João
Descrição: Dashboard não está carregando os dados corretamente
Data de Entrega: 2026-03-30
```

### 2. Campos disponíveis (opcionais):

- **Título:** (obrigatório) - Nome do card
- **Responsável:** (opcional) - Nome do colaborador
- **Descrição:** (opcional) - Descrição detalhada
- **Data de Entrega:** (opcional) - Formato: YYYY-MM-DD

### 3. Executar importação:

```bash
npx tsx scripts/import-from-folders.ts
```

## Estrutura:

```
jira-import/
├── parainiciar/     → Cards vão para coluna "Para Iniciar"
│   ├── card1.txt
│   └── card2.txt
├── emandamento/     → Cards vão para coluna "Em Andamento"
│   ├── card3.txt
│   └── card4.txt
└── README.md
```
