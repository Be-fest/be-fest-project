-- Adicionar campos de breakdown de convidados na tabela events
-- Execute este script no SQL Editor do Supabase

-- Adicionar campos para breakdown de convidados
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS full_guests integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS half_guests integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_guests integer DEFAULT 0;

-- Adicionar comentários para documentar os campos
COMMENT ON COLUMN public.events.full_guests IS 'Convidados pagando preço integral (13+ anos)';
COMMENT ON COLUMN public.events.half_guests IS 'Convidados pagando meia entrada (6-12 anos)';
COMMENT ON COLUMN public.events.free_guests IS 'Convidados gratuitos (0-5 anos)';

-- Criar função para atualizar guest_count automaticamente baseado no breakdown
CREATE OR REPLACE FUNCTION update_guest_count_from_breakdown()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar guest_count como soma dos breakdowns
    NEW.guest_count = COALESCE(NEW.full_guests, 0) + COALESCE(NEW.half_guests, 0) + COALESCE(NEW.free_guests, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar guest_count automaticamente
DROP TRIGGER IF EXISTS update_guest_count_trigger ON public.events;
CREATE TRIGGER update_guest_count_trigger
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_guest_count_from_breakdown();

-- Atualizar eventos existentes (se houver) para distribuir guest_count nos breakdowns
-- Por padrão, colocar tudo como full_guests se não especificado
UPDATE public.events 
SET 
    full_guests = COALESCE(guest_count, 0),
    half_guests = 0,
    free_guests = 0
WHERE 
    full_guests IS NULL OR half_guests IS NULL OR free_guests IS NULL;

-- Verificar se a atualização foi bem-sucedida
SELECT 
    id, 
    title, 
    guest_count, 
    full_guests, 
    half_guests, 
    free_guests,
    (full_guests + half_guests + free_guests) as calculated_total
FROM public.events 
LIMIT 5; 