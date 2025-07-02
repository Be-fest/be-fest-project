# Configuração do Supabase para Be Fest

## 🔑 Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis no seu arquivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

## 📍 Como Obter as Chaves

1. **Acesse seu projeto no Supabase Dashboard**
2. **Vá em Settings > API**
3. **Copie as seguintes chaves:**
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## 🗄️ Schema do Banco de Dados

### ⚠️ IMPORTANTE: Criar os tipos primeiro!

Execute o seguinte SQL no SQL Editor do Supabase **ANTES** de criar as tabelas:

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipos personalizados (enums)
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE service_status AS ENUM ('active', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
CREATE TYPE event_service_status AS ENUM ('pending_provider_approval', 'approved', 'in_progress', 'completed', 'cancelled');
```

### 🚀 Método Recomendado: Arquivo Completo

Execute o arquivo `supabase/setup_database.sql` no SQL Editor do Supabase. Este arquivo contém:

- ✅ Criação dos tipos (enums)
- ✅ Tabelas (`users`, `events`, `services`, `bookings`, etc.)
- ✅ Triggers automáticos
- ✅ Políticas de RLS
- ✅ Índices de performance
- ✅ Categorias padrão

**OU** execute manualmente os comandos acima primeiro e depois o arquivo `src/lib/supabase/schema.sql`

## 🚀 Como Funciona o Registro Agora

### ✅ **Usando Service-Role Key**

1. **Admin Client** contorna todas as políticas RLS
2. **Criação direta** de usuário com `auth.admin.createUser()`
3. **Auto-confirmação** de email (`email_confirm: true`)
4. **Criação manual** de perfis nas tabelas `profiles` e `provider_profiles`
5. **Limpeza automática** se algum passo falhar

### 📝 **Fluxo de Registro Cliente:**
```typescript
// 1. Validação dos dados
const validatedData = registerClientSchema.parse(rawData)

// 2. Criação do usuário via Admin API
const { data: authData } = await supabaseAdmin.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // Email já confirmado
  user_metadata: { full_name, cpf, phone, role: 'client' }
})

// 3. Criação do perfil (contorna RLS)
await supabaseAdmin.from('profiles').insert({
  id: authData.user.id,
  role: 'client',
  full_name,
  phone
})
```

### 📝 **Fluxo de Registro Prestador:**
```typescript
// Mesmo fluxo + criação adicional do provider_profile
await supabaseAdmin.from('provider_profiles').insert({
  id: authData.user.id,
  business_name,
  category
})
```

## 🔒 Segurança

- **Service-role key** só é usada no servidor (Server Actions)
- **Nunca** exposta ao cliente
- **Limpeza transacional** se algum passo falhar
- **Validação rigorosa** com Zod schemas

## ✅ Vantagens da Nova Abordagem

1. **Sem dependência de triggers** problemáticos
2. **Controle total** sobre o processo de criação
3. **Feedback detalhado** de erros
4. **Transações seguras** com rollback
5. **Performance melhorada** sem consultas desnecessárias

O registro agora é **100% confiável** e funciona independente das configurações de RLS! 🎉 