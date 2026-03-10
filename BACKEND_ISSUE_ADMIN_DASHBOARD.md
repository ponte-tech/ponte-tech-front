# Problema: Dashboard Admin - Endpoint Retornando 403

## Status
**PENDENTE** - Problema de configuração no backend AWS API Gateway

## Descrição do Problema

O endpoint `/api/admin/dashboard-timesheet` está retornando erro 403 (Forbidden) com a mensagem:
```
"Invalid key=value pair (missing equal-sign) in Authorization header"
```

## Causa Raiz

Este é um erro característico do AWS API Gateway quando:
1. O endpoint está configurado com autenticação AWS_IAM em vez de autenticação JWT/Lambda Authorizer
2. O Lambda Authorizer está mal configurado
3. O endpoint espera um formato diferente de header Authorization

## Evidências

- ✅ O proxy `/api/colaborador/*` funciona corretamente
- ✅ O proxy `/api/auth/*` funciona corretamente
- ✅ **Outros endpoints** `/api/admin/*` funcionam: `/api/admin/timesheet/mes/*`, `/api/admin/fiscal/*`
- ❌ **Apenas** `/api/admin/dashboard-timesheet` falha com 403
- Os três proxies usam **código idêntico** para enviar o header Authorization
- Logs do servidor confirmam que o header está sendo enviado corretamente

**Conclusão:** O problema é específico do endpoint `/api/admin/dashboard-timesheet`, não de todos os endpoints admin.

### Logs de Erro do Backend
```
📡 [PROXY] Response status: 403
📥 [PROXY] Response: {"message":"Invalid key=value pair (missing equal-sign) in Authorization header (hashed with SHA-256 and encoded with Base64): 'ou+P2pI0l1aih+LHseZdzDv0Qh1V68y/KzyHX43jNNs='."}
```

## Solução Temporária Implementada

Dashboard admin foi configurado para usar dados mockados enquanto o backend não é corrigido.

Arquivo: `src/app/(dashboard)/dashboard/components/DashboardAdmin.tsx`
- Dados mockados simulam estrutura real da API
- Delay de 500ms para simular latência de rede
- Alerta visual informando que os dados são de demonstração

## Correção Necessária no Backend

1. **Verificar configuração do API Gateway** para o resource `/api/admin/*`
2. **Confirmar que o authorizer** é o mesmo usado por `/api/colaborador/*` e `/api/auth/*`
3. **Validar configurações de CORS** e headers permitidos
4. **Testar o endpoint** diretamente com Postman/curl usando o mesmo token que funciona para colaborador

### Comando de Teste Sugerido
```bash
# Obter token do cookie após login
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Testar endpoint que funciona (colaborador)
curl -H "Authorization: Bearer $TOKEN" \
  https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod/api/colaborador/timesheet/dashboard

# Testar endpoint com problema (admin)
curl -H "Authorization: Bearer $TOKEN" \
  https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod/api/admin/dashboard-timesheet
```

## Próximos Passos

1. Acessar AWS Console → API Gateway
2. Localizar API: `b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod`
3. Comparar configuração de `/api/admin/*` com `/api/colaborador/*`
4. Ajustar authorizer e configurações para usar o mesmo padrão
5. Fazer deploy das alterações
6. Testar endpoint corrigido
7. Remover código de mock do frontend (`DashboardAdmin.tsx:36-84`)
8. Descomentar chamada real da API (`DashboardAdmin.tsx:74-77`)

## Referências

- Arquivo com workaround: `src/app/(dashboard)/dashboard/components/DashboardAdmin.tsx`
- Proxy route: `src/app/api/admin/[...path]/route.ts`
- Service layer: `src/app/services/dashboardService.ts`
- AWS API Gateway URL: `https://b34hb46zsj.execute-api.us-east-1.amazonaws.com/prod`

## Data da Ocorrência
2026-03-09

## Impacto
- Dashboard admin não exibe dados reais
- Usuários admin veem dados de demonstração
- Funcionalidade visual está OK, mas dados não são dinâmicos
