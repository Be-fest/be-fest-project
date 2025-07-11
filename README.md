# Be Fest - Plataforma de Organização de Festas

Uma plataforma moderna construída com **Next.js 15**, **Supabase** e **Clean Architecture**, seguindo as melhores práticas de 2025.

## 🏗️ Arquitetura Moderna

### ✅ Padrões Implementados (2025)

- **Data Access Layer (DAL)** com React `cache()` para otimização
- **Server Actions** para mutations server-side type-safe
- **Proximidade de Auth Checks** - autenticação próxima aos dados
- **Clean Architecture** adaptada para Next.js 15
- **SOLID Principles** aplicados consistentemente

### 🚫 Padrões Removidos (Angular-style)

- ❌ Services (AuthService, BaseService) 
- ❌ API Routes para autenticação
- ❌ Client-side auth logic
- ❌ Prop drilling de handlers

## 🎯 Stack Tecnológico

- **Framework**: Next.js 15 com App Router
- **Database**: Supabase (PostgreSQL + Auth)
- **UI**: Tailwind CSS + Framer Motion
- **Validação**: Zod schemas
- **Type Safety**: TypeScript end-to-end

## 📁 Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router (pages)
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard cliente/prestador
│   └── ...
├── components/            # Componentes React
│   ├── forms/            # Formulários com Server Actions
│   ├── ui/               # Componentes base
│   └── ...
├── lib/
│   ├── dal.ts            # Data Access Layer (❤️ NEW)
│   ├── actions/          # Server Actions (❤️ NEW)
│   └── supabase/         # Cliente Supabase
├── types/                # Types TypeScript
└── utils/                # Funções utilitárias
```

## 🔒 Sistema de Autenticação Moderno

### Data Access Layer (DAL)

```typescript
// src/lib/dal.ts - Server-only com React cache()
import 'server-only'
import { cache } from 'react'

export const verifySession = cache(async () => {
  // Auth check com cache automático
})

export const getCurrentUser = cache(async () => {
  // User fetch com autorização
})
```

### Server Actions

```typescript
// src/lib/actions/auth.ts - Type-safe mutations
'use server'

export async function registerClientAction(formData: FormData) {
  // Validação com Zod
  // Auth check próximo aos dados
  // Database operations
  // Redirect/revalidate
}
```

### Componentes com useActionState

```typescript
// Componentes usam React 19 useActionState
export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(wrappedAction, initial)
  
  return (
    <form action={formAction}>
      {/* Form progressivamente enhanceado */}
    </form>
  )
}
```

## 🗄️ Estrutura do Banco (Supabase)

### Tabelas Principais

```sql
-- Usuários (conectada a auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role user_role DEFAULT 'client',
  full_name text,
  email text,
  cpf text,
  cnpj text,
  whatsapp_number text,
  organization_name text,
  area_of_operation text
);

-- Perfis de prestadores
CREATE TABLE public.provider_profiles (
  id uuid PRIMARY KEY REFERENCES users(id),
  business_name text NOT NULL,
  category text,
  description text,
  cnpj text,
  rating numeric DEFAULT 0
);

-- Eventos e serviços
CREATE TABLE public.events (...);
CREATE TABLE public.services (...);
```

## 🚀 Fluxo de Registro

### Para Clientes
1. **Form submission** → Server Action
2. **Validação** com Zod schemas
3. **Check duplicates** via DAL
4. **Create auth user** + **database record**
5. **Auto redirect** para dashboard

### Para Prestadores
1. **Validation** + **duplicate checks**
2. **Create user** + **provider profile**
3. **Transactional safety** (rollback on errors)
4. **Redirect** para dashboard prestador

## 🔐 Segurança Implementada

### ✅ Auth Checks Próximos aos Dados

```typescript
// ✅ CORRETO - Auth no DAL
export const getUserData = cache(async (userId: string) => {
  const currentUser = await verifySession() // Auth check aqui
  if (!currentUser) throw new Error('Unauthorized')
  
  return await db.users.findUnique({ where: { id: userId } })
})
```

### ✅ Data Transfer Objects (DTOs)

```typescript
// ✅ CORRETO - Controla dados expostos
export const getUserProfileDTO = cache(async (userId: string) => {
  const user = await getUserById(userId)
  const isAdmin = currentUser.role === 'admin'
  
  return {
    id: user.id,
    name: user.full_name,
    email: isAdmin ? user.email : null, // Condicional
    role: isAdmin ? user.role : null
  }
})
```

### ✅ Server Actions com Validação

```typescript
'use server'
export async function updateProfile(formData: FormData) {
  const session = await verifySession() // Auth primeiro
  if (!session) return { error: 'Unauthorized' }
  
  const validated = schema.parse(rawData) // Validação
  // Database operation
}
```

## 🎨 Características da UI

### Responsividade Completa
- **Mobile-first** design
- **Breakpoints**: `sm:` `md:` `lg:` `xl:`
- **Grid adaptativo**: 1→2→3 colunas
- **Typography scaling**: `text-sm` → `text-lg`

### Componentes Modernos
- **Framer Motion** animations
- **Progressive enhancement** com Server Actions
- **Loading states** integrados
- **Error boundaries** properly handled

## 🧪 Como Testar

```bash
# Build de produção
npm run build

# Desenvolvimento
npm run dev

# Verificar se está funcionando
# 1. Ir para /auth/register
# 2. Preencher formulário (cliente ou prestador)
# 3. Verificar no Supabase:
#    - auth.users (criado)
#    - public.users (criado)
#    - public.provider_profiles (se prestador)
```

## 🎯 Próximos Passos

### Funcionalidades Sugeridas
- [ ] **Multi-factor Authentication** (MFA)
- [ ] **Email verification** flow
- [ ] **Password reset** via email
- [ ] **OAuth providers** (Google, Facebook)
- [ ] **Rate limiting** com Upstash Redis
- [ ] **Audit logging** para ações sensíveis

### Performance
- [ ] **Edge functions** para auth callbacks
- [ ] **Database connection pooling**
- [ ] **CDN optimization** para assets
- [ ] **Error monitoring** com Sentry

## 📊 Métricas de Performance

- **Build time**: ~14s
- **First Load JS**: 101-217kB
- **Type Safety**: 100% TypeScript
- **Security**: DAL + Server Actions
- **Architecture**: Clean + SOLID

## 🤝 Contribuindo

Esta arquitetura segue as **melhores práticas de 2025** para Next.js:

1. **DAL over Services** - dados centralizados
2. **Server Actions over API Routes** - type safety
3. **Proximity Principle** - auth próximo aos dados  
4. **React 19 features** - useActionState, cache()
5. **Clean Architecture** - separação de responsabilidades

---

**Construído com ❤️ usando as tecnologias mais modernas de 2025**

- Next.js 15 + App Router
- Supabase Auth + Database  
- Clean Architecture + SOLID
- TypeScript + Zod + Tailwind

# Be Fest - Plataforma de Organização de Festas

## Como o Registro de Usuários Funciona

### Estrutura do Banco de Dados

O sistema agora usa a seguinte estrutura no Supabase:

#### Tabela `auth.users`
- Gerenciada automaticamente pelo Supabase Auth
- Contém informações de autenticação (email, senha, etc.)

#### Tabela `public.users`
- Contém informações do perfil do usuário
- Campos: id, role, full_name, email, cpf, cnpj, whatsapp_number, etc.
- Conectada à `auth.users` via foreign key

#### Tabela `public.provider_profiles`
- Apenas para prestadores de serviços
- Contém informações específicas do negócio
- Conectada à `public.users` via foreign key

### Fluxo de Registro

#### Para Clientes:
1. Usuário preenche o formulário com: nome, email, senha, CPF, telefone
2. Sistema verifica se email e CPF já existem
3. Cria usuário em `auth.users`
4. Cria perfil em `public.users` com role 'client'
5. Faz login automático e redireciona para `/dashboard`

#### Para Prestadores de Serviços:
1. Usuário preenche o formulário com: nome da empresa, email, senha, CNPJ, telefone, área de atuação
2. Sistema verifica se email e CNPJ já existem
3. Cria usuário em `auth.users`
4. Cria perfil em `public.users` com role 'provider'
5. Cria perfil adicional em `public.provider_profiles`
6. Faz login automático e redireciona para `/dashboard/prestador`

### Serviços Implementados

#### AuthService
- `signUp()`: Cria usuário e perfil
- `signIn()`: Faz login
- `checkEmailExists()`: Verifica email duplicado
- `checkDocumentExists()`: Verifica CPF/CNPJ duplicado
- `createProviderProfile()`: Cria perfil de prestador
- Outros métodos de autenticação

### Validações
- Emails únicos
- CPF único para clientes
- CNPJ único para prestadores
- Formatação automática de CPF, CNPJ e telefone
- Senhas seguras

### Uso

```typescript
// Registro de cliente
const clientData = {
  fullName: "João Silva",
  email: "joao@email.com", 
  password: "senha123",
  cpf: "123.456.789-00",
  phone: "(11) 99999-9999"
}

// Registro de prestador
const providerData = {
  companyName: "Empresa ABC",
  email: "empresa@email.com",
  password: "senha123", 
  cnpj: "12.345.678/0001-90",
  phone: "(11) 99999-9999",
  areaOfOperation: "buffet"
}
```

O sistema agora está totalmente funcional e integrado com o Supabase!
#   b e - f e s t - p r o j e c t 
 
 