# Correção dos Problemas de Autenticação

## Problema Identificado

O erro "Database error saving new user" ocorria durante o `auth.signUp()` do Supabase antes mesmo do código da aplicação executar. As principais causas eram:

1. **Falta de trigger automático** para criar perfil na `public.users`
2. **Políticas RLS muito restritivas** sem permissão de INSERT
3. **Enum `user_role` continha 'admin'** causando inconsistências
4. **Código tentava inserir manualmente** após signUp, mas era bloqueado pelas políticas

## Solução Implementada

### 1. Script de Correção do Banco (`supabase/fix_auth_registration.sql`)

Execute este script no SQL Editor do Supabase:

```sql
-- Corrige enum removendo 'admin'
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('client', 'provider');

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
-- (código completo no arquivo)

-- Trigger para executar quando usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS corrigidas
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
-- (outras políticas no arquivo)
```

### 2. Código de Auth Modificado

O código foi simplificado para usar o trigger automático:

**Antes:**
```javascript
// Fazia signUp e depois tentava INSERT manual
const { data } = await supabase.auth.signUp({...})
await supabase.from('users').insert({...}) // ❌ Falhava aqui
```

**Depois:**
```javascript
// Agora envia todos os dados nos metadados
const { data } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: nome,
      role: 'client', // ou 'provider'
      cpf: cpf,
      whatsapp_number: phone,
      // ... outros dados
    }
  }
})
// ✅ Trigger cria o perfil automaticamente
```

### 3. Fallback no Login

Adicionado fallback para criar perfil se não existir (usuários antigos):

```javascript
// Se perfil não encontrado no login, cria um básico
if (userError.code === 'PGRST116') {
  await supabase.from('users').insert({
    id: authData.user.id,
    email: authData.user.email,
    role: 'client',
    // ...
  })
}
```

## Como Aplicar a Correção

### PRIMEIRO: Verificar estrutura atual
```bash
# No SQL Editor do Supabase, execute primeiro:
supabase/check_database_structure.sql
```

### Opção 1: Script completo (recomendado)
```bash
# No SQL Editor do Supabase, execute:
supabase/fix_auth_registration.sql
```

### Opção 2: Se der erro "column role does not exist"
```bash
# Use o script mais simples:
supabase/quick_fix.sql
```

### Passo 2: Teste a correção
```bash
# Execute o script de teste:
supabase/test_auth_fix.sql
```

### Passo 3: Teste o cadastro
- Acesse a página de registro
- Tente cadastrar um cliente e um prestador
- Verifique se não há mais erros nos logs

## Verificação

### Logs esperados após a correção:

**Cliente:**
```
Attempting client signup with trigger...
User created successfully with trigger: [uuid]
Client registration completed successfully
```

**Prestador:**
```
Attempting provider signup with trigger...
Provider user created successfully with trigger: [uuid]
Provider registration completed successfully
```

### No banco de dados:
```sql
-- Verificar se trigger existe
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar se função existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Verificar enum
SELECT enum_range(NULL::user_role);
-- Deve retornar: {client,provider}
```

## Benefícios da Nova Abordagem

1. **✅ Automático**: Perfil criado automaticamente no signup
2. **✅ Consistente**: Sem race conditions ou timing issues
3. **✅ Seguro**: Políticas RLS adequadas
4. **✅ Simples**: Menos código, menos pontos de falha
5. **✅ Robusto**: Fallback para usuários antigos

## Possíveis Problemas e Soluções

### ❌ Erro: "column role does not exist"
**Solução:** Use o script `supabase/quick_fix.sql` ao invés do `fix_auth_registration.sql`

### ❌ Erro: "table users does not exist" 
**Solução:** Execute `supabase/check_database_structure.sql` primeiro, depois `quick_fix.sql`

### Se ainda houver erro após aplicar a correção:

1. **Verificar se o script foi executado completamente**
   ```sql
   SELECT trigger_name FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

2. **Verificar logs do Postgres** no Supabase Dashboard
   - Settings > Logs > Postgres Logs

3. **Desabilitar RLS temporariamente** (apenas para teste)
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   -- Teste o cadastro
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ```

4. **Verificar permissões**
   ```sql
   GRANT ALL ON public.users TO authenticated;
   ```

## Teste Completo

Para testar se tudo está funcionando:

1. ✅ Execute `fix_auth_registration.sql`
2. ✅ Execute `test_auth_fix.sql` 
3. ✅ Teste cadastro de cliente na aplicação
4. ✅ Teste cadastro de prestador na aplicação
5. ✅ Teste login com usuários criados
6. ✅ Verifique se perfis aparecem no banco

Se todos os passos passarem, o problema está resolvido! 🎉

---

## 🚨 CORREÇÃO PARA SEU ERRO ESPECÍFICO

Você está recebendo o erro `column "role" does not exist`. Isso significa que a tabela `users` não tem a estrutura correta. 

### Solução Rápida:

1. **Execute primeiro** (para verificar o estado atual):
   ```sql
   -- No SQL Editor do Supabase:
   -- Cole todo o conteúdo de supabase/check_database_structure.sql
   ```

2. **Execute depois** (correção):
   ```sql
   -- No SQL Editor do Supabase:
   -- Cole todo o conteúdo de supabase/quick_fix.sql
   ```

3. **Teste o cadastro** na aplicação

### ⚠️ ATENÇÃO:
O script `quick_fix.sql` cria a tabela do zero com a estrutura correta. Se você tem dados importantes na tabela `users`, faça backup primeiro.

### O que o quick_fix.sql faz:
- ✅ Cria enum `user_role` correto (client, provider)
- ✅ Cria tabela `users` com todas as colunas necessárias
- ✅ Adiciona foreign key para `auth.users`
- ✅ Cria função e trigger automático
- ✅ Configura políticas RLS permissivas
- ✅ Grant de permissões necessárias

Após executar, o cadastro deve funcionar normalmente! 🎯 