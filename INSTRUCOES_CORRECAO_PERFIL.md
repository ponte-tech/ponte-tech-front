# Instruções para Corrigir o Perfil do Usuário

## Problema
O perfil do usuário `teste@gmail.com` (Tailini Andrade) estava exibindo "Vendedor" ao invés de "Colaborador" no menu superior.

## Causa
O problema ocorreu porque:
1. O código do Navbar.tsx estava com uma lógica incompleta que só diferenciava "Aluno" e "Vendedor"
2. O usuário já estava logado com dados antigos armazenados no cache do navegador (localStorage + cookies)

## Correções Aplicadas

### 1. ✅ Correção no Banco de Dados
O registro no DynamoDB já está correto:
- `user_id`: `11f4f306-7017-4d00-9556-35ce57f354e8`
- `email`: `teste@gmail.com`
- `nome_completo`: `Tailini Andrade`
- `profiles`: `["colaborador"]` ✅

### 2. ✅ Correção no Código (Navbar.tsx)
Atualizado o componente Navbar para exibir corretamente todos os tipos de usuário:
- Administrador
- Colaborador
- Aluno
- Vendedor
- Professor
- Contador

## Solução para o Usuário

Para que o perfil seja exibido corretamente, o usuário precisa fazer logout e login novamente:

### Opção 1: Via Interface (Recomendado)
1. Clicar no avatar/nome no canto superior direito
2. Clicar em "Sair"
3. Fazer login novamente com:
   - Email: `teste@gmail.com`
   - Senha: [senha cadastrada]

### Opção 2: Limpar Cache Manualmente
No navegador (Chrome/Edge/Firefox):
1. Abrir as DevTools (F12)
2. Ir na aba "Application" (Chrome) ou "Storage" (Firefox)
3. Expandir "Local Storage" e selecionar `http://localhost:3000`
4. Clicar com botão direito e selecionar "Clear"
5. Expandir "Cookies" e selecionar `http://localhost:3000`
6. Deletar o cookie `token`
7. Recarregar a página (F5)
8. Fazer login novamente

## Verificação

Após fazer login novamente, o menu superior deve exibir:
```
Tailini Andrade
Colaborador       ← Deve aparecer "Colaborador" aqui
```

## Outros Usuários

Se outros usuários tiverem o mesmo problema:
1. Verificar se o perfil está correto no banco de dados (usar comando AWS CLI)
2. Fazer logout e login novamente
3. Se o problema persistir, verificar os logs do backend durante o login

## Comandos Úteis

### Verificar usuário no DynamoDB:
```bash
aws dynamodb scan \
  --table-name ponte-tech-core \
  --filter-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"teste@gmail.com"}}' \
  --region us-east-1 \
  | grep -A 5 "profiles"
```

### Resultado esperado:
```json
"profiles": {
    "L": [
        {
            "S": "colaborador"
        }
    ]
}
```
