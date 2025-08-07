# 📋 Guia Completo do Sistema Be-Fest

## 🎯 Visão Geral
O Be-Fest é uma plataforma completa para organização de festas e eventos, conectando clientes, prestadores de serviços e administradores em um sistema integrado.

---

## 🔐 Sistema de Autenticação

### 👤 Login como Cliente (Usuário Final)
**URL:** https://befest.vercel.app/auth/login

**Como acessar:**
1. Acesse o link de login
2. Digite seu email e senha
3. Após o login, será redirecionado para a página principal
4. Poderá criar festas, buscar prestadores e gerenciar seus eventos

**Funcionalidades do Cliente:**
- Criar e gerenciar festas
- Buscar prestadores por categoria
- Solicitar orçamentos
- Acompanhar histórico de eventos
- Gerenciar perfil pessoal

---

### 🏢 Login como Prestador de Serviços
**URL:** https://befest.vercel.app/auth/login

**Como acessar:**
1. Acesse o link de login
2. Digite seu email e senha de prestador
3. Após o login, será redirecionado para `/dashboard/prestador`
4. Poderá gerenciar serviços, orçamentos e perfil profissional

**Funcionalidades do Prestador:**
- Gerenciar serviços oferecidos
- Responder solicitações de orçamento
- Acompanhar histórico de trabalhos
- Configurar perfil profissional
- Visualizar estatísticas de performance

---

### 👨‍💼 Login como Administrador
**URL:** https://befest.vercel.app/auth/admin-login

**Como acessar:**
1. Acesse o link específico para administradores
2. Digite email e senha de administrador
3. Após o login, será redirecionado para `/admin`
4. Terá acesso ao painel administrativo

**Funcionalidades do Admin:**
- Visualizar estatísticas gerais da plataforma
- Gerenciar clientes e prestadores
- Acompanhar pedidos e transações
- Moderar conteúdo da plataforma
- Gerar relatórios

**Rota do Dashboard Admin:** `/admin`

---

### 🔑 Login como Super Administrador
**URL:** https://befest.vercel.app/super-admin

**Credenciais do Super-Admin:**
```
Email: befestsuperadmin@superadm.com
Senha: jHxBm9kx8chuYN7b1pCtG1r3bGFS7JZR
```

**Como acessar:**
1. Acesse o link do super-admin
2. Digite as credenciais fornecidas
3. Após o login, terá acesso ao painel de criação de administradores

**Funcionalidades do Super-Admin:**
- **Criar novos administradores** (função principal)
- Gerenciar acesso de administradores
- Controle total sobre o sistema
- Acesso a todas as funcionalidades administrativas

**⚠️ Importante:** O Super-Admin é o **único** que pode cadastrar novos administradores no sistema.

---

## 🔄 Hierarquia de Usuários

```
Super-Admin (befestsuperadmin@superadm.com)
    ↓ (cria)
Administradores
    ↓ (gerenciam)
Clientes e Prestadores
```

### Descrição dos Níveis:
- **Super-Admin**: Administrador principal que cadastra outros administradores
- **Admin**: Administradores que podem visualizar informações, gerenciar usuários e moderar a plataforma
- **Prestador**: Profissionais que oferecem serviços para festas
- **Cliente**: Usuários finais que organizam festas e contratam serviços

---

## 🚀 Fluxo de Cadastro

### Para Clientes:
1. Acessar https://befest.vercel.app/auth/register
2. Preencher dados pessoais
3. Confirmar email
4. Fazer login e começar a usar

### Para Prestadores:
1. Acessar https://befest.vercel.app/seja-um-prestador
2. Preencher dados profissionais
3. Aguardar aprovação (se necessário)
4. Fazer login e configurar serviços

### Para Administradores:
1. **Apenas o Super-Admin pode criar administradores**
2. Super-Admin acessa `/super-admin`
3. Preenche dados do novo admin
4. Admin recebe credenciais
5. Admin pode acessar `/auth/admin-login`

---

## 🔧 Funcionalidades por Nível

### 📊 Dashboard do Cliente
- Minhas festas ativas
- Histórico de eventos
- Orçamentos solicitados
- Prestadores favoritos

### 📈 Dashboard do Prestador
- Solicitações de orçamento
- Histórico de trabalhos
- Estatísticas de performance
- Gerenciamento de serviços

### 📋 Dashboard do Admin
- Estatísticas gerais da plataforma
- Gestão de usuários (clientes e prestadores)
- Moderação de conteúdo
- Relatórios financeiros

### 🛠️ Dashboard do Super-Admin
- Criação de novos administradores
- Gestão de administradores existentes
- Controle total do sistema

---

## 🔗 Links Importantes

| Tipo de Usuário | URL de Login | Dashboard |
|------------------|--------------|-----------|
| Cliente | https://befest.vercel.app/auth/login | `/` (página principal) |
| Prestador | https://befest.vercel.app/auth/login | `/dashboard/prestador` |
| Admin | https://befest.vercel.app/auth/admin-login | `/admin` |
| Super-Admin | https://befest.vercel.app/super-admin | `/super-admin` |

---

## 🔐 Segurança e Controle de Acesso

### Middleware de Autenticação
O sistema possui middleware que:
- Protege rotas administrativas
- Verifica níveis de acesso
- Redireciona usuários não autorizados
- Mantém sessões seguras

### Rotas Protegidas:
- `/admin/*` - Apenas administradores
- `/dashboard/*` - Usuários autenticados
- `/super-admin` - Apenas super-administradores
- `/perfil` - Usuários autenticados

---

## 📱 Como Usar o Sistema

### 1. **Para Organizar uma Festa (Cliente):**
   - Faça login como cliente
   - Clique em "Nova Festa"
   - Preencha os detalhes do evento
   - Busque prestadores por categoria
   - Solicite orçamentos
   - Compare propostas e contrate

### 2. **Para Oferecer Serviços (Prestador):**
   - Faça login como prestador
   - Configure seu perfil profissional
   - Adicione seus serviços
   - Responda solicitações de orçamento
   - Acompanhe seus trabalhos

### 3. **Para Administrar (Admin):**
   - Faça login no painel administrativo
   - Monitore estatísticas da plataforma
   - Gerencie usuários quando necessário
   - Analise relatórios de desempenho

### 4. **Para Criar Admins (Super-Admin):**
   - Faça login como super-admin
   - Acesse o formulário de criação
   - Preencha dados do novo administrador
   - Confirme a criação
   - Compartilhe credenciais com segurança

---

## 🆘 Suporte e Dúvidas

Em caso de problemas:
1. Verifique se está usando a URL correta para seu tipo de usuário
2. Confirme se suas credenciais estão corretas
3. Para criar novos administradores, apenas o Super-Admin pode fazê-lo
4. Para questões técnicas, entre em contato com o suporte técnico

---

**🎉 Bem-vindo ao Be-Fest! Sua plataforma completa para organização de festas e eventos!**
