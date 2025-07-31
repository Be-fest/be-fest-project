-- Script para corrigir os preços incorretos dos serviços
-- Baseado na lógica: fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2) + 5% taxa + CEIL()

-- 1. Primeiro, vamos verificar todos os registros com preços incorretos
SELECT 
  es.id,
  es.event_id,
  es.price_per_guest_at_booking,
  es.total_estimated_price as preco_atual,
  e.full_guests,
  e.half_guests,
  e.free_guests,
  -- Cálculo correto (base + 5% taxa + CEIL):
  CEIL(
    ((e.full_guests * es.price_per_guest_at_booking) + 
     (e.half_guests * (es.price_per_guest_at_booking / 2))) * 1.05
  ) as preco_correto,
  -- Diferença:
  es.total_estimated_price - CEIL(
    ((e.full_guests * es.price_per_guest_at_booking) + 
     (e.half_guests * (es.price_per_guest_at_booking / 2))) * 1.05
  ) as diferenca
FROM event_services es
JOIN events e ON es.event_id = e.id
WHERE es.price_per_guest_at_booking IS NOT NULL
  AND es.total_estimated_price IS NOT NULL
ORDER BY diferenca DESC;

-- 2. Atualizar todos os preços incorretos
UPDATE event_services 
SET total_estimated_price = CEIL(
  ((e.full_guests * event_services.price_per_guest_at_booking) + 
   (e.half_guests * (event_services.price_per_guest_at_booking / 2))) * 1.05
)
FROM events e
WHERE event_services.event_id = e.id
  AND event_services.price_per_guest_at_booking IS NOT NULL
  AND event_services.total_estimated_price IS NOT NULL
  AND event_services.total_estimated_price != CEIL(
    ((e.full_guests * event_services.price_per_guest_at_booking) + 
     (e.half_guests * (event_services.price_per_guest_at_booking / 2))) * 1.05
  );

-- 3. Verificar se a correção foi aplicada
SELECT 
  es.id,
  es.price_per_guest_at_booking,
  es.total_estimated_price as preco_atualizado,
  e.full_guests,
  e.half_guests,
  -- Cálculo para confirmar (base + 5% taxa + CEIL):
  CEIL(
    ((e.full_guests * es.price_per_guest_at_booking) + 
     (e.half_guests * (es.price_per_guest_at_booking / 2))) * 1.05
  ) as confirmacao
FROM event_services es
JOIN events e ON es.event_id = e.id
WHERE es.price_per_guest_at_booking IS NOT NULL
  AND es.total_estimated_price IS NOT NULL
ORDER BY es.updated_at DESC
LIMIT 10; 