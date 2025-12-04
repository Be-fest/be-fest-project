# Instruções para Corrigir a Deleção de Prestadores

## Problema
Ao tentar deletar um prestador em `admin/prestadores`, ocorre o erro:
```
Error deleting provider: update or delete on table "services" violates foreign key constraint "service_guest_tiers_service_id_fkey" on table "service_guest_tiers"
```

## Solução

### Passo 1: Executar a Função SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `src/lib/supabase/function-delete-provider.sql`
4. Execute o SQL

Isso criará a função `delete_provider_cascade` que deleta o prestador e todas as suas dependências na ordem correta.

### Passo 2: Testar a Deleção

Agora você pode testar a deleção de um prestador em `admin/prestadores`. O sistema tentará:

1. **Primeiro**: Usar a função SQL `delete_provider_cascade` (mais eficiente)
2. **Se falhar**: Usar o método manual que deleta tudo na ordem correta:
   - service_guest_tiers (CRÍTICO - deve ser deletado primeiro!)
   - service_age_pricing_rules
   - service_date_surcharges
   - event_services
   - bookings
   - services
   - users

## O que foi corrigido

### 1. Função SQL (`src/lib/supabase/function-delete-provider.sql`)
- Corrigido o bug do parâmetro `provider_id` que conflitava com a coluna
- Mudado para `p_provider_id` para evitar ambiguidade
- Removido `DISABLE TRIGGER ALL` (não é necessário e pode causar problemas)

### 2. Função JavaScript (`src/lib/actions/admin.ts`)
- Simplificado o código
- Corrigido a ordem de deleção (service_guest_tiers PRIMEIRO!)
- Adicionado logs detalhados para debug
- Melhorado tratamento de erros com mensagens específicas

## Verificação

Após executar o SQL, você pode verificar se a função foi criada corretamente executando:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'delete_provider_cascade';
```

Deve retornar:
```
routine_name            | routine_type
delete_provider_cascade | FUNCTION
```

## Testando

1. Vá em `admin/prestadores`
2. Clique no botão de deletar de algum prestador
3. Confirme a deleção
4. Verifique o console do navegador para ver os logs
5. O prestador e todos os seus dados relacionados devem ser deletados com sucesso!
