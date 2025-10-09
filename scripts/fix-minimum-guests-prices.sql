-- Script para corrigir preços de event_services que não respeitaram o mínimo de convidados
-- Autor: Sistema Be-Fest
-- Data: 2025-10-09

-- IMPORTANTE: Este script corrige valores onde o cliente tem MENOS convidados que o mínimo
-- mas foi cobrado apenas pelos convidados reais, ao invés do mínimo

-- ====================================================================================
-- ETAPA 1: Identificar event_services com valores incorretos
-- ====================================================================================

-- Criar tabela temporária para armazenar os cálculos corretos
CREATE TEMP TABLE temp_price_corrections AS
WITH menor_tier_por_servico AS (
  -- Encontrar o menor tier (menor mínimo de convidados) de cada serviço
  SELECT 
    service_id,
    MIN(min_total_guests) as menor_minimo,
    (SELECT base_price_per_adult 
     FROM service_guest_tiers sgt2 
     WHERE sgt2.service_id = sgt.service_id 
     AND sgt2.min_total_guests = MIN(sgt.min_total_guests)
     LIMIT 1) as preco_menor_tier
  FROM service_guest_tiers sgt
  GROUP BY service_id
)
SELECT 
  es.id as event_service_id,
  es.event_id,
  es.service_id,
  es.price_per_guest_at_booking as current_price_per_guest,
  es.total_estimated_price as current_total_price,
  e.full_guests,
  e.half_guests,
  (e.full_guests + e.half_guests) as total_guests,
  mt.menor_minimo as min_total_guests,
  NULL::integer as max_total_guests,
  mt.preco_menor_tier as tier_price,
  
  -- Calcular o preço correto (sempre cobrar pelo mínimo do menor tier)
  mt.menor_minimo * mt.preco_menor_tier as correct_base_price,
  
  -- Calcular o preço com taxa de 10% (para o cliente)
  CEIL((mt.menor_minimo * mt.preco_menor_tier) * 1.10) as correct_total_price_with_fee
FROM 
  event_services es
  INNER JOIN events e ON es.event_id = e.id
  INNER JOIN services s ON es.service_id = s.id
  INNER JOIN menor_tier_por_servico mt ON s.id = mt.service_id
WHERE 
  -- Eventos onde o número de convidados é MENOR que o mínimo do menor tier
  (e.full_guests + e.half_guests) < mt.menor_minimo
  -- E o preço atual está incorreto (menor que deveria ser)
  AND es.total_estimated_price < CEIL((mt.menor_minimo * mt.preco_menor_tier) * 1.10);

-- ====================================================================================
-- ETAPA 2: Mostrar os casos que serão corrigidos (para revisão)
-- ====================================================================================

SELECT 
    event_service_id,
    service_id,
    total_guests || ' convidados (mínimo: ' || min_total_guests || ')' as guests_info,
    'R$ ' || ROUND(current_total_price, 2) as current_price,
    'R$ ' || ROUND(correct_total_price_with_fee, 2) as correct_price,
    'R$ ' || ROUND(correct_total_price_with_fee - current_total_price, 2) as difference
FROM 
    temp_price_corrections
ORDER BY 
    event_service_id;

-- ====================================================================================
-- ETAPA 3: Atualizar os preços incorretos
-- ====================================================================================

-- ⚠️ ATENÇÃO: Esta etapa irá alterar os preços no banco de dados!
-- Execute apenas após confirmar que os 4 eventos da ETAPA 2 estão corretos

UPDATE event_services es
SET 
    total_estimated_price = tpc.correct_total_price_with_fee,
    updated_at = NOW()
FROM 
    temp_price_corrections tpc
WHERE 
    es.id = tpc.event_service_id;

-- Verificar quantos registros foram atualizados
SELECT COUNT(*) as registros_atualizados FROM temp_price_corrections;

-- ====================================================================================
-- ETAPA 4: Relatório final
-- ====================================================================================

SELECT 
    COUNT(*) as total_eventos_afetados,
    SUM(correct_total_price_with_fee - current_total_price) as valor_total_diferenca,
    AVG(total_guests) as media_convidados,
    AVG(min_total_guests) as media_minimo_convidados
FROM 
    temp_price_corrections;

-- Limpar tabela temporária
DROP TABLE IF EXISTS temp_price_corrections;

-- ====================================================================================
-- NOTAS IMPORTANTES:
-- ====================================================================================
-- 1. Este script identifica event_services onde o cliente tem menos convidados 
--    que o mínimo, mas foi cobrado apenas pelos convidados reais
-- 
-- 2. A correção aplica a regra: Sempre cobrar pelo mínimo de convidados quando
--    o cliente tem menos que o mínimo
--
-- 3. O preço para o cliente inclui taxa de 10% (já aplicada no correct_total_price_with_fee)
--
-- 4. Revise os resultados da ETAPA 2 antes de descomentar e executar a ETAPA 3
--
-- 5. Após a correção, os novos serviços já usarão a lógica corrigida automaticamente
-- ====================================================================================
