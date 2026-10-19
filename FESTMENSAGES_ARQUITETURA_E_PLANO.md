# Projeto FestMensages | Be Fest — Análise de Arquitetura e Plano de Implementação

## Etapa 1: Análise do Projeto Existente

### 1.1. Linguagens, Frameworks e Arquitetura
- **Framework Principal**: Next.js 16.1.1 (App Router) com React 19 e TypeScript 5.
- **Estilização e UI**: Tailwind CSS v4, Framer Motion para animações e `react-icons` (`md` e `fa`).
- ** Validação**: Zod + React Hook Form.
- **Banco de Dados e Autenticação**: Supabase (`@supabase/ssr` e `@supabase/supabase-js`), utilizando `createServerClient()` (com cookies) e `createAdminClient()` (com `SUPABASE_SERVICE_ROLE_KEY` para operações administrativas e triggers internos).
- **Padrão de Arquitetura**: Server Actions em `src/lib/actions/*.ts` e Route Handlers em `src/app/api/*/route.ts`.

### 1.2. Entidades Principais do Banco de Dados
1. **`users`**: Armazena clientes (`role = 'client'`), prestadores (`role = 'provider'`), administradores (`role = 'admin'`) e super administradores (`role = 'super_admin'`). Campos relevantes para comunicação: `id`, `full_name`, `organization_name`, `email`, `whatsapp_number`, `created_at`.
2. **`services` e `service_guest_tiers`**: Serviços/cardápios cadastrados exclusivamente por prestadores, com faixas de preço variáveis por quantidade de convidados.
3. **`events`**: Eventos/festas criados por clientes (`client_id`, `title`, `event_date`, `start_time`, `location`, `guest_count`, `full_guests`, `half_guests`, `free_guests`, `status`).
4. **`event_services`**: Entidade central de pedidos/contratações que vincula um evento (`event_id`) a um serviço (`service_id`) e prestador (`provider_id`), com `booking_status` (`'pending_provider_approval' | 'waiting_payment' | 'approved' | 'in_progress' | 'completed' | 'cancelled'`).
5. **`budgets`**: Orçamentos avulsos gerados pelo prestador na ferramenta `BudgetCreator` (`status: 'draft' | 'sent' | 'paid'`, `payment_link`).
6. **`email_templates`**: Tabela inicial existente com apenas 2 tipos (`welcome_client` e `welcome_provider`).
7. **`chat_messages`**: Mensagens de chat liberadas após confirmação de pagamento (`booking_status = 'approved'`).

### 1.3. Mapeamento dos Fluxos Atuais e Decisões Técnicas (Seções 3 e 4)
| Ocasião / Gatilho | Fluxo no Sistema Atual | Destinatário(s) | Decisão Técnica Documentada |
| :--- | :--- | :--- | :--- |
| **1. Cadastro do cliente** | `registerClientAction` (`src/lib/actions/auth.ts`) | Cliente | Dispara evento `client.registered` (E-mail e/ou WhatsApp de boas-vindas). Mantém compatibilidade com o fluxo existente sem bloquear o cadastro. |
| **2. Cadastro do prestador** | `registerProviderAction` (`src/lib/actions/auth.ts`) | Prestador | Dispara evento `provider.registered` (E-mail e/ou WhatsApp de boas-vindas e orientações iniciais). |
| **3. Cadastro de serviços** | `createServiceAction` (`src/lib/actions/services.ts`) | **Apenas Prestador** | No Be Fest, o cadastro de serviços (`services`) é **exclusivo do prestador**. Conforme instruído na especificação (*"Se alguma etapa for exclusiva do prestador, não crie um fluxo artificial para o cliente. Registre a decisão e preserve a intenção original"*), `service.created` notifica apenas o prestador. Para o cliente, a adição de serviços à sua festa ocorre via `order.created`. |
| **4. Envio de orçamentos** | `saveBudgetAction` / `updateBudgetStatusAction` (`status = 'sent'`) em `src/lib/actions/budgets.ts` e aprovação de orçamento em `event_services` | Cliente e Prestador | Dispara `budget.sent` confirmando ao prestador o envio da proposta/link de pagamento e enviando ao cliente (quando e-mail/WhatsApp informado) o aviso de orçamento disponível. |
| **5. Chegada de pedido (Agenda)** | `createEventServiceAction` (`event-services.ts`) e `addServiceToCartAction` (`cart.ts`) com `booking_status = 'pending_provider_approval'` | Cliente e Prestador | Dispara `order.created`: avisa o **cliente** que seu pedido foi enviado e aguarda confirmação na agenda do prestador, e avisa o **prestador** que há um novo pedido pendente na sua agenda. |
| **6. Pedido para pagamento** | `updateEventServiceStatusAction(id, 'waiting_payment')` (`event-services.ts`) quando o prestador aprova a disponibilidade | Cliente e Prestador | Dispara `order.waiting_payment`: envia ao **cliente** as instruções e link para pagamento, e confirma ao **prestador** que o pedido avançou para a etapa de pagamento. **Nunca** envia confirmação de pagamento aprovado nesta etapa. |
| **7. Pagamento aprovado / 1ª e 2ª Parcelas** | `updateEventServiceStatusAction(id, 'approved')`, `updateBudgetStatusAction(id, 'paid')` ou webhook/API de pagamento | Cliente e Prestador | Dispara `payment.approved` (para cliente e prestador), além de suportar `payment.installment_1_paid` e `payment.installment_2_paid` para o prestador. Bloqueia qualquer disparo se o status do pagamento ainda for `pending` ou `waiting_payment`. |
| **8. Lembrete de agenda** | Job/verificador de eventos próximos (`processScheduledReminders`) | Cliente e Prestador | Dispara `event.reminder` antes da `event_date` para eventos com `booking_status = 'approved'`. |
| **9. Avaliação pós-evento** | `updateEventServiceStatusAction(id, 'completed')` ou pós-data do evento | Cliente e Prestador | Dispara `event.completed`: solicita avaliação ao cliente e avisa o prestador sobre a conclusão/avaliação. |
| **10. Campanhas Sazonais, Pontos/Cupons, Inativos e FestPlus** | Módulo de Campanhas do FestMensages (`festmensages_campaigns`) | Clientes ou Prestadores elegíveis | Permite criar e disparar campanhas de sazonalidade, pontos/cupons, reativação de inativos e oportunidades FestPlus, respeitando janela de vigência e opt-out LGPD. |

---

## Etapa 2: Plano de Implementação

### 2.1. Banco de Dados (`src/lib/supabase/festmensages_migration.sql`)
Criação de estrutura dedicada, relacional e idempotente:
1. `festmensages_templates`: Modelos reutilizáveis (operacionais e promocionais) com validação de variáveis obrigatórias, suporte a HTML, texto simples e nome de template aprovado no WhatsApp Business.
2. `festmensages_rules`: Regras de automação vinculando eventos (`event_type`), destinatário (`client`, `provider`, `both`), canal (`email`, `whatsapp`, `both`), modelo, condições, prazo/delay e controle de repetição.
3. `festmensages_queue`: Fila assíncrona com chave de idempotência única (`idempotency_key`), controle de tentativas (`attempts`, `max_attempts`), backoff progressivo (`next_retry_at`), status (`pending`, `processing`, `sent`, `failed`, `skipped`, `test_mode_logged`) e flag `is_test`.
4. `festmensages_logs`: Histórico rastreável de execuções, tentativas, IDs de mensagem do provedor externo e erros sanitizados (sem exposição de credenciais).
5. `festmensages_campaigns`: Campanhas sazonais e de relacionamento com público-alvo, período (`start_date`, `end_date`), canal e métricas.
6. `festmensages_preferences`: Gestão de consentimento e descadastro (LGPD), separando comunicações operacionais de promocionais.
7. `festmensages_channel_configs`: Parâmetros e status das integrações de E-mail (Resend) e WhatsApp Business Cloud API / Z-API / Evolution.

### 2.2. Arquivos a Criar e Modificar
- **Novos arquivos do núcleo (`src/lib/festmensages/`)**:
  - `src/lib/festmensages/types.ts` — Tipagens completas do módulo.
  - `src/lib/festmensages/defaults.ts` — Catálogo padrão de 18 modelos e regras operacionais/sazonais para clientes e prestadores.
  - `src/lib/festmensages/template-engine.ts` — Motor de variáveis dinâmicas, validação de variáveis obrigatórias, sanitização de logs e layout HTML com rodapé LGPD.
  - `src/lib/festmensages/channels/email-channel.ts` — Provedor de e-mail (Resend) com suporte a HTML/Texto, rastreamento de ID e Modo de Teste transparente.
  - `src/lib/festmensages/channels/whatsapp-channel.ts` — Provedor WhatsApp Business API oficial (Meta Cloud API / compatível) com suporte a templates aprovados, normalização de telefone, rate-limit e Modo de Teste transparente.
  - `src/lib/festmensages/engine.ts` — Orquestrador central (`dispatchFestEvent`, deduplicação, fila, backoff progressivo, reprocessamento seguro, lembretes de agenda e execução de campanhas).
- **Server Actions e Rotas de API**:
  - `src/lib/actions/festmensages.ts` — Actions administrativas protegidas por permissão de admin (`getFestMensagesDashboardAction`, CRUD de modelos, regras, campanhas, fila/falhas, reprocessamento, disparo de teste e configurações).
  - `src/app/api/festmensages/cron/route.ts` — Endpoint para processamento da fila de retentativas e lembretes agendados.
  - `src/app/api/festmensages/unsubscribe/route.ts` — Endpoint público LGPD para descadastro de comunicações promocionais.
- **Integrações nos fluxos existentes (não-bloqueantes)**:
  - `src/lib/actions/auth.ts` (`registerClientAction`, `registerProviderAction`)
  - `src/lib/actions/services.ts` (`createServiceAction`)
  - `src/lib/actions/budgets.ts` (`saveBudgetAction`, `updateBudgetStatusAction`)
  - `src/lib/actions/event-services.ts` (`createEventServiceAction`, `updateEventServiceStatusAction`)
  - `src/lib/actions/cart.ts` (`addServiceToCartAction`)
- **Painel Administrativo**:
  - `src/app/admin/festmensages/page.tsx` — Painel completo do FestMensages com 8 abas (Dashboard, Modelos, Regras, Histórico, Falhas/Fila, Campanhas, Configurações e Teste de Mensagem).
  - `src/components/admin/AdminSidebar.tsx` — Inclusão do item **FestMensages** no menu administrativo.
- **Testes Automatizados**:
  - `src/lib/festmensages/__tests__/festmensages.test.ts` — Suíte de verificação cobrindo os 10 critérios de aceitação da seção 12.

---

## Etapa 3 & 4: Implementação do Núcleo e Painel Administrativo
1. **Modelos de Mensagem (`defaults.ts` + `festmensages_templates`)**:
   - 18 modelos pré-configurados divididos entre **Cliente** (`client_welcome`, `client_budget_sent`, `client_order_pending_agenda`, `client_order_waiting_payment`, `client_payment_approved`, `client_event_reminder`, `client_post_event_review`, `client_seasonality_campaign`, `client_points_coupons`, `client_inactive_reactivation`) e **Prestador** (`provider_welcome`, `provider_service_created`, `provider_budget_sent`, `provider_order_arrived`, `provider_order_waiting_payment`, `provider_payment_approved_installment_1`, `provider_payment_installment_2`, `provider_event_reminder`, `provider_post_event_review`, `provider_seasonality_campaign`, `provider_inactive_reactivation`, `provider_festplus_campaign`).
2. **Motor de Regras, Idempotência e Retentativas (`engine.ts`)**:
   - Chave única de idempotência (`idempotency_key`) que impede duplicidade mesmo se um webhook ou action for chamado repetidas vezes.
   - Guarda de segurança estrita para pagamentos (`CONFIRMED_PAYMENT_STATUSES`): bloqueia qualquer tentativa de disparo de confirmação de pagamento se o status for `pending`, `waiting_payment` ou não confirmado.
   - Retentativas com backoff progressivo configurável (`5 min` -> `30 min` -> `120 min`) e reprocessamento manual seguro que impede reenvio de itens já entregues (`status = 'sent'`).
   - Conformidade LGPD nativa: separação entre mensagens `operational` e `promotional`, rodapé de descadastro automático nos e-mails promocionais e rota `/api/festmensages/unsubscribe`.
3. **Painel Administrativo (`/admin/festmensages`)**:
   - Integrado ao menu lateral (`AdminSidebar.tsx`) e protegido por `verifyAdminPermission`.
   - 8 abas completas: **Dashboard**, **Modelos de Mensagens** (com editor, validador de variáveis e pré-visualização em tempo real), **Regras de Automação**, **Histórico de Envios**, **Falhas e Fila**, **Campanhas Sazonais e Relacionamento**, **Configurações de Canais** e **Disparo de Teste / Sandbox**.

---

## Etapa 5: Testes e Validação dos 10 Critérios de Aceitação
A suíte automatizada em `src/lib/festmensages/__tests__/festmensages.test.ts` valida:
1. ✅ Cada evento dispara a notificação correta (`order.created` aciona regras de cliente e prestador).
2. ✅ Clientes e prestadores recebem somente as mensagens destinadas a eles (`service.created` notifica exclusivamente o prestador).
3. ✅ As variáveis dinâmicas são interpoladas e validadas antes do envio (variáveis obrigatórias ausentes bloqueiam o envio e registram erro claro).
4. ✅ Eventos repetidos não geram notificações duplicadas (idempotência garantida).
5. ✅ Pagamentos pendentes jamais geram confirmação de pagamento.
6. ✅ Falhas temporárias respeitam backoff progressivo e permitem reprocessamento seguro.
7. ✅ O histórico e a fila registram o resultado detalhado e sanitizado das operações.
8. ✅ Campanhas respeitam janela de vigência (`start_date` / `end_date`), público-alvo e opt-out LGPD.
9. ✅ Permissões administrativas bloqueiam usuários comuns/prestadores e autorizam `admin` / `super_admin`.
10. ✅ Modo de teste opera com transparência (`test_mode_logged`) sem simular entregas externas falsas.

---

## Etapa 6: Instruções de Ativação e Variáveis de Ambiente
1. **Aplicar Migração SQL no Supabase**:
   Execute o script `src/lib/supabase/festmensages_migration.sql` no SQL Editor do Supabase. Ele é 100% idempotente (`CREATE TABLE IF NOT EXISTS` / `ON CONFLICT DO NOTHING`) e já popula todos os modelos, regras e campanhas iniciais.
   *(Nota: Enquanto a migração não for executada ou em ambiente local sem credenciais, o motor opera automaticamente com fallback resiliente em memória em Modo de Teste).*
2. **Variáveis de Ambiente Opcionais para Produção (`.env.local`)**:
   - **E-mail (Resend)**:
     - `RESEND_API_KEY=re_...`
     - `EMAIL_FROM="Be Fest <noreply@befest.com.br>"`
   - **WhatsApp Business Cloud API (Meta Oficial ou Gateway compatível)**:
     - `WHATSAPP_ACCESS_TOKEN=EAA...`
     - `WHATSAPP_PHONE_NUMBER_ID=...`
     - `WHATSAPP_BUSINESS_ACCOUNT_ID=...`
     - *(Ou `WHATSAPP_API_URL` para gateway customizado)*
   - **Controle de Modo de Teste e Cron**:
     - `FESTMENSAGES_TEST_MODE=false` *(defina como `true` para forçar sandbox mesmo com credenciais)*
     - `CRON_SECRET=...` *(para proteger `GET /api/festmensages/cron`)*

