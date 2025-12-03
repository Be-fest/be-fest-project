-- Criar função PostgreSQL para deletar prestador sem constraint issues
-- Execute isso no Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_provider_cascade(provider_id uuid)
RETURNS TABLE (success boolean, message text) AS $$
DECLARE
  deleted_services int := 0;
  deleted_bookings int := 0;
  deleted_guest_tiers int := 0;
  deleted_age_pricing int := 0;
  deleted_surcharges int := 0;
  deleted_event_services int := 0;
  deleted_user int := 0;
BEGIN
  -- Desabilitar temporariamente as constraints
  ALTER TABLE public.service_guest_tiers DISABLE TRIGGER ALL;
  ALTER TABLE public.bookings DISABLE TRIGGER ALL;
  ALTER TABLE public.event_services DISABLE TRIGGER ALL;
  ALTER TABLE public.service_age_pricing_rules DISABLE TRIGGER ALL;
  ALTER TABLE public.service_date_surcharges DISABLE TRIGGER ALL;
  ALTER TABLE public.services DISABLE TRIGGER ALL;

  -- Deletar guest tiers
  DELETE FROM public.service_guest_tiers
  WHERE service_id IN (SELECT id FROM public.services WHERE provider_id = provider_id);
  GET DIAGNOSTICS deleted_guest_tiers = ROW_COUNT;

  -- Deletar bookings
  DELETE FROM public.bookings
  WHERE service_id IN (SELECT id FROM public.services WHERE provider_id = provider_id);
  GET DIAGNOSTICS deleted_bookings = ROW_COUNT;

  -- Deletar event services
  DELETE FROM public.event_services
  WHERE service_id IN (SELECT id FROM public.services WHERE provider_id = provider_id);
  GET DIAGNOSTICS deleted_event_services = ROW_COUNT;

  -- Deletar age pricing rules
  DELETE FROM public.service_age_pricing_rules
  WHERE service_id IN (SELECT id FROM public.services WHERE provider_id = provider_id);
  GET DIAGNOSTICS deleted_age_pricing = ROW_COUNT;

  -- Deletar surcharges
  DELETE FROM public.service_date_surcharges
  WHERE service_id IN (SELECT id FROM public.services WHERE provider_id = provider_id);
  GET DIAGNOSTICS deleted_surcharges = ROW_COUNT;

  -- Deletar services
  DELETE FROM public.services WHERE provider_id = provider_id;
  GET DIAGNOSTICS deleted_services = ROW_COUNT;

  -- Deletar user
  DELETE FROM public.users WHERE id = provider_id;
  GET DIAGNOSTICS deleted_user = ROW_COUNT;

  -- Reabilitar as constraints
  ALTER TABLE public.service_guest_tiers ENABLE TRIGGER ALL;
  ALTER TABLE public.bookings ENABLE TRIGGER ALL;
  ALTER TABLE public.event_services ENABLE TRIGGER ALL;
  ALTER TABLE public.service_age_pricing_rules ENABLE TRIGGER ALL;
  ALTER TABLE public.service_date_surcharges ENABLE TRIGGER ALL;
  ALTER TABLE public.services ENABLE TRIGGER ALL;

  -- Retornar resultado
  RETURN QUERY SELECT
    true as success,
    'Deleted: ' || deleted_services || ' services, ' ||
    deleted_bookings || ' bookings, ' ||
    deleted_guest_tiers || ' guest tiers, ' ||
    deleted_age_pricing || ' age pricing rules, ' ||
    deleted_surcharges || ' surcharges, ' ||
    deleted_event_services || ' event services, ' ||
    deleted_user || ' user' as message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão de execução
GRANT EXECUTE ON FUNCTION delete_provider_cascade(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_provider_cascade(uuid) TO anon;
