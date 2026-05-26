# 🏦 Integração Mercado Pago — Geração Automática de Link de Pagamento

## ✅ O que já está pronto no projeto

O código já tem tudo preparado para funcionar! Aqui está o que já existe:

### 1. API Route para gerar o link
- Arquivo: `src/app/api/generate-budget-payment-link/route.ts`
- Rota: `POST /api/generate-budget-payment-link`
- Recebe `clientName`, `totalPrice` e `budgetId`
- Cria uma **Preferência de Pagamento** na API do Mercado Pago
- Retorna o `init_point` (link de checkout) para o cliente pagar

### 2. Lógica no BudgetCreator
- Arquivo: `src/components/dashboard/BudgetCreator.tsx`
- Função `handleGenerateAndSave`
- Quando o prestador clica "Salvar e Gerar", o sistema:
  1. Chama a API `/api/generate-budget-payment-link` com o valor total
  2. Recebe o link de pagamento gerado
  3. Salva o orçamento com o link embutido
  4. Exibe o link no preview/PDF para o cliente

### 3. URLs de retorno configuradas
- Sucesso: `/pagamento/sucesso`
- Erro: `/pagamento/erro`
- Pendente: `/pagamento/pendente`

---

## 🔧 O que falta para funcionar em produção

### Passo 1 — Criar uma conta de vendedor no Mercado Pago

1. Acesse https://www.mercadopago.com.br
2. Crie ou acesse sua conta (a conta que vai **receber** os pagamentos)
3. Vá em **Seu negócio → Configurações → Credenciais**
   - Ou diretamente: https://www.mercadopago.com.br/developers/panel/app

### Passo 2 — Obter o Access Token de Produção

1. No painel de desenvolvedores, crie uma **aplicação** (ou use a existente)
2. Vá em **Credenciais de Produção**
3. Copie o **Access Token** (começa com `APP_USR-...`)

> ⚠️ **NUNCA** exponha o Access Token no frontend. Ele já está sendo usado corretamente no backend (server-side) via `process.env.MERCADO_PAGO_ACCESS_TOKEN`.

### Passo 3 — Configurar a variável de ambiente na Vercel

1. Acesse o dashboard da Vercel (https://vercel.com) → seu projeto `befest`
2. Vá em **Settings → Environment Variables**
3. Adicione:

| Nome | Valor | Ambientes |
|------|-------|-----------|
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-xxxxxxxxxx` | Production, Preview |

4. **Faça um novo deploy** para que a variável entre em vigor (basta dar push no git ou clicar "Redeploy")

### Passo 4 — Testar

1. Crie um orçamento no dashboard do prestador
2. Ao clicar "Salvar e Gerar", o link do Mercado Pago será gerado automaticamente
3. O link aparecerá no preview do orçamento e no PDF
4. O cliente clica no link → é redirecionado para o checkout do Mercado Pago → paga → é redirecionado de volta

---

## 📋 Checklist Rápido

- [ ] Criar conta no Mercado Pago (se ainda não tiver)
- [ ] Obter o **Access Token de Produção** no painel de desenvolvedores
- [ ] Adicionar `MERCADO_PAGO_ACCESS_TOKEN` nas **Environment Variables** da Vercel
- [ ] Fazer redeploy do projeto
- [ ] Testar criando um orçamento

---

## 🔔 Opcional: Webhooks (notificação de pagamento)

Se quiser ser notificado quando um pagamento for aprovado (para atualizar o status do orçamento automaticamente para "Pago"), você pode configurar um **webhook**:

1. No painel do Mercado Pago: **Configurações → Webhooks**
2. URL de notificação: `https://befest.vercel.app/api/webhooks/mercadopago`
3. Eventos: `payment`

> ℹ️ Essa parte (webhook) **não está implementada ainda** no código. É uma melhoria futura. Por enquanto, o prestador pode alterar manualmente o status do orçamento para "Pago".

---

## 💡 Fluxo Completo

```
Prestador preenche orçamento
        ↓
Clica "Salvar e Gerar"
        ↓
App chama POST /api/generate-budget-payment-link
        ↓
API cria preferência no Mercado Pago (valor total + dados)
        ↓
Mercado Pago retorna link de checkout (init_point)
        ↓
App salva orçamento + link no banco de dados
        ↓
Prestador envia PDF/WhatsApp com link para o cliente
        ↓
Cliente clica no link → paga no Mercado Pago
        ↓
Mercado Pago redireciona para /pagamento/sucesso
```

---

## ⚙️ Detalhes Técnicos

| Item | Valor |
|------|-------|
| **API usada** | Mercado Pago Preferences API v1 |
| **Endpoint** | `https://api.mercadopago.com/v1/preferences` |
| **Moeda** | BRL (Real) |
| **Retorno automático** | Sim (`auto_return: approved`) |
| **Referência externa** | ID do orçamento (para rastrear) |
| **SDK necessário** | Nenhum — usa `fetch` direto na API REST |
| **Variável de ambiente** | `MERCADO_PAGO_ACCESS_TOKEN` |
