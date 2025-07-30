# 🔧 Correção de Preços dos Serviços

Este diretório contém scripts para corrigir os preços incorretos dos serviços no banco de dados.

## 📊 Problema Identificado

Os preços dos serviços estavam sendo calculados incorretamente no banco de dados. A lógica correta é:

```
fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2)
```

**Exemplo:**
- 100 convidados inteiros × R$ 140 = R$ 14.000
- 20 convidados meia × R$ 70 = R$ 1.400
- **Total correto: R$ 15.400**

## 🛠️ Scripts Disponíveis

### 1. `fix-service-prices.sql`
Script SQL para executar diretamente no banco de dados.

**Como usar:**
```bash
# Execute no seu cliente SQL (pgAdmin, DBeaver, etc.)
# Copie e cole o conteúdo do arquivo
```

### 2. `fix-database-prices.js`
Script Node.js para executar via linha de comando.

**Como usar:**
```bash
# Instalar dependências (se necessário)
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
export NEXT_PUBLIC_SUPABASE_URL="sua_url_do_supabase"
export SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"

# Executar o script
node scripts/fix-database-prices.js
```

## 📋 Passos para Correção

### Opção 1: Via SQL (Recomendado)

1. **Verificar dados incorretos:**
```sql
-- Execute a primeira query do arquivo fix-service-prices.sql
-- para ver quais registros precisam ser corrigidos
```

2. **Aplicar correção:**
```sql
-- Execute a segunda query do arquivo fix-service-prices.sql
-- para atualizar todos os preços incorretos
```

3. **Verificar correção:**
```sql
-- Execute a terceira query do arquivo fix-service-prices.sql
-- para confirmar que os preços foram corrigidos
```

### Opção 2: Via Node.js

1. **Configurar ambiente:**
```bash
# Certifique-se de que as variáveis de ambiente estão configuradas
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

2. **Executar correção:**
```bash
node scripts/fix-database-prices.js
```

3. **Verificar resultado:**
O script mostrará automaticamente o resumo da correção.

## 🔍 Verificação Manual

Para verificar se um preço está correto:

```sql
SELECT 
  es.id,
  es.price_per_guest_at_booking,
  es.total_estimated_price as preco_atual,
  e.full_guests,
  e.half_guests,
  -- Cálculo correto:
  (e.full_guests * es.price_per_guest_at_booking) + 
  (e.half_guests * (es.price_per_guest_at_booking / 2)) as preco_correto
FROM event_services es
JOIN events e ON es.event_id = e.id
WHERE es.id = 'id_do_servico';
```

## ⚠️ Importante

- **Backup:** Faça backup do banco antes de executar as correções
- **Teste:** Execute primeiro em um ambiente de teste
- **Verificação:** Sempre verifique os resultados após a correção

## 📈 Resultado Esperado

Após a correção, os preços devem estar assim:

| Serviço | Preço Atual | Preço Correto | Status |
|---------|-------------|---------------|--------|
| Serviço 1 | R$ 9.600 | R$ 8.800 | ✅ Corrigido |
| Serviço 2 | R$ 16.800 | R$ 15.400 | ✅ Corrigido |

## 🎯 Fórmula de Cálculo

```javascript
// Para cada serviço:
const fullGuestsValue = fullGuests * pricePerGuest;
const halfGuestsValue = halfGuests * (pricePerGuest / 2);
const serviceValue = fullGuestsValue + halfGuestsValue;

// Para múltiplos serviços:
const subtotal = services.reduce((sum, service) => sum + serviceValue, 0);
const befestFee = subtotal * 0.05; // 5%
const total = subtotal + befestFee;
``` 