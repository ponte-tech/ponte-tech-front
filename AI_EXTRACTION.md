# 🤖 Extração Automática de Valores com IA

## Visão Geral

O sistema agora possui **extração automática de valores** de documentos fiscais (PDFs, DARFs, guias de impostos, boletos) usando **Inteligência Artificial da Anthropic Claude**.

Quando você faz upload de um arquivo na tela de cadastro de impostos, a IA automaticamente:
1. 📄 Lê o documento (PDF ou imagem)
2. 🔍 Identifica o valor total a pagar
3. ✅ Mostra o valor extraído com nível de confiança
4. 💡 Sugere o valor para você confirmar

## Como Funciona

### Tecnologia Utilizada
- **Claude 3.5 Sonnet** - Modelo de IA multimodal da Anthropic
- **Vision API** - Capacidade de ler e interpretar documentos visuais
- **Prompt Engineering** - Instruções otimizadas para documentos fiscais brasileiros

### Fluxo de Extração

```
1. Upload do Arquivo
   ↓
2. Conversão para Base64
   ↓
3. Envio para Claude Vision API
   ↓
4. IA Analisa o Documento
   ↓
5. Extrai Valor Total + Confiança
   ↓
6. Exibe Resultado na Interface
```

### Tipos de Documentos Suportados

✅ **Suportados para Extração:**
- PDF (até 5MB)
- JPEG/JPG (até 5MB)
- PNG (até 5MB)

✅ **Tipos de Documentos Fiscais:**
- DARF (Documento de Arrecadação de Receitas Federais)
- Guias de impostos estaduais/municipais
- Boletos bancários
- DAS (Documento de Arrecadação do Simples Nacional)
- Guias de INSS, FGTS
- Comprovantes de pagamento

## Configuração

### 1. Obter API Key da Anthropic

1. Acesse: https://console.anthropic.com/
2. Crie uma conta ou faça login
3. Navegue até "API Keys"
4. Clique em "Create Key"
5. Copie a chave gerada (formato: `sk-ant-api03-...`)

### 2. Configurar no Projeto

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o arquivo .env.local
nano .env.local
```

Adicione sua API key:
```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui
```

### 3. Reiniciar o Servidor

```bash
npm run dev
```

## Uso

### Na Interface

1. **Acesse**: http://localhost:3000/dashboard/contabilidade/impostos
2. **Clique**: "Cadastrar Imposto"
3. **Faça Upload**: Selecione um PDF ou imagem de documento fiscal
4. **Aguarde**: A IA irá extrair automaticamente
5. **Veja o Resultado**:
   - ✅ Valor detectado (verde) - com % de confiança
   - ⚠️ Valor não detectado (âmbar) - entrada manual necessária
   - ❌ Erro na extração (vermelho) - problema no processamento

### Exemplos de Feedback Visual

```
✅ Valor detectado: R$ 1.234,56 [95%]
   └─ Alta confiança, valor provavelmente correto

✅ Valor detectado: R$ 523,00 [75%]
   └─ Média confiança, revisar recomendado

⚠️ Valor não detectado automaticamente
   └─ Documento não legível ou formato não reconhecido

❌ Erro ao extrair valor
   └─ Problema técnico, tente novamente
```

## Vantagens

### ⚡ Agilidade
- **Antes**: Digite manualmente cada valor
- **Agora**: IA extrai automaticamente em segundos

### ✅ Precisão
- Reduz erros de digitação
- Identifica o valor correto mesmo em documentos complexos
- Nível de confiança indica quando revisar

### 💼 Produtividade
- Economize tempo em tarefas repetitivas
- Foque em revisão ao invés de digitação
- Processe múltiplos documentos rapidamente

## Limitações

### Tamanho de Arquivo
- **Máximo**: 5MB por arquivo
- **Recomendado**: PDFs otimizados ou imagens em resolução adequada

### Qualidade do Documento
- ✅ **Funciona bem**: PDFs digitais, scans de alta qualidade
- ⚠️ **Pode falhar**: Scans de baixa qualidade, documentos manuscritos

### Idioma
- Otimizado para documentos fiscais **brasileiros**
- Entende termos como: "Valor do Documento", "Total a Pagar", etc.

## Custo

### API da Anthropic
- **Modelo**: Claude 3.5 Sonnet
- **Preço** (jan 2025):
  - Input: ~$3 por milhão de tokens
  - Output: ~$15 por milhão de tokens

### Estimativa por Documento
- **1 página PDF**: ~0,3-0,5 centavos de dólar
- **1000 documentos/mês**: ~$3-5 USD

💡 **Dica**: Para grandes volumes, considere cache de documentos já processados.

## Troubleshooting

### ❌ "API key não configurada"
**Solução**: Adicione `NEXT_PUBLIC_ANTHROPIC_API_KEY` no `.env.local`

### ❌ "Erro ao processar documento"
**Soluções**:
1. Verifique se a API key está correta
2. Confirme que o arquivo não excede 5MB
3. Tente converter o PDF para imagem JPG
4. Verifique seu saldo na conta Anthropic

### ⚠️ "Valor não detectado"
**Motivos comuns**:
- Documento não é fiscal (ex: contrato, nota explicativa)
- Scan de baixíssima qualidade
- Formato não padrão
- Valor em local não convencional

**Solução**: Digite manualmente o valor nesses casos.

### 🐛 "Valor extraído incorreto"
**O que fazer**:
1. Sempre **revise** valores extraídos
2. Confiança < 80%: revisar obrigatoriamente
3. Reporte problemas recorrentes para melhorar o prompt

## Segurança e Privacidade

### 🔒 Dados Enviados
- Apenas a **imagem do documento** é enviada para Anthropic
- Nenhum dado pessoal adicional
- Anthropic não armazena documentos (conforme política)

### 🛡️ Recomendações
- Use API keys com permissões mínimas necessárias
- Monitore uso da API no dashboard da Anthropic
- Implemente rate limiting para evitar abusos

## Arquitetura Técnica

### Componentes

```
Frontend (Next.js/React)
│
├── documentExtractionService.ts
│   ├── fileToBase64()
│   ├── extractValueFromDocument()
│   └── Claude API Integration
│
└── impostos/novo/page.tsx
    ├── handleFileChange()
    ├── UI Feedback (Loading, Success, Error)
    └── Display Extracted Values
```

### API Call Flow

```typescript
// 1. Arquivo → Base64
const base64 = await fileToBase64(file);

// 2. Chamar Claude Vision API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', data: base64 } },
        { type: 'text', text: 'Extraia o valor total...' }
      ]
    }]
  })
});

// 3. Parsear resposta JSON
const { valor, confidence } = parseResponse(response);
```

## Roadmap Futuro

### 🚀 Melhorias Planejadas

- [ ] Cache de documentos já processados
- [ ] Extração de múltiplos campos (vencimento, emissor, etc.)
- [ ] Suporte a múltiplos idiomas
- [ ] Treinamento com documentos específicos da empresa
- [ ] Validação cruzada com regras de negócio
- [ ] Relatório de precisão da extração

## Suporte

### Documentação Adicional
- **Anthropic Claude**: https://docs.anthropic.com/
- **Vision API**: https://docs.anthropic.com/claude/docs/vision

### Problemas?
- Abra uma issue no repositório
- Consulte os logs do console do navegador
- Verifique o dashboard da Anthropic para status da API

---

**✨ Feature implementada em**: Março 2026
**🤖 Powered by**: Anthropic Claude 3.5 Sonnet
