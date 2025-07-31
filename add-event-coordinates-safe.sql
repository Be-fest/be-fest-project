-- Script seguro para adicionar campos de coordenadas na tabela events
-- Este script verifica se as colunas já existem antes de criá-las

DO $$ 
BEGIN
    -- Adicionar event_latitude se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'event_latitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN event_latitude DECIMAL(10, 8);
        RAISE NOTICE 'Coluna event_latitude adicionada à tabela events';
    ELSE
        RAISE NOTICE 'Coluna event_latitude já existe na tabela events';
    END IF;

    -- Adicionar event_longitude se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'event_longitude'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN event_longitude DECIMAL(11, 8);
        RAISE NOTICE 'Coluna event_longitude adicionada à tabela events';
    ELSE
        RAISE NOTICE 'Coluna event_longitude já existe na tabela events';
    END IF;
END $$;

-- Criar índice espacial para as coordenadas dos eventos (se não existir)
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(event_latitude, event_longitude);

-- Adicionar comentários sobre os campos
DO $$
BEGIN
    -- Comentário para event_latitude
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'event_latitude'
        AND table_schema = 'public'
    ) THEN
        COMMENT ON COLUMN public.events.event_latitude IS 'Latitude do local do evento (obtida via geocoding)';
    END IF;

    -- Comentário para event_longitude
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'event_longitude'
        AND table_schema = 'public'
    ) THEN
        COMMENT ON COLUMN public.events.event_longitude IS 'Longitude do local do evento (obtida via geocoding)';
    END IF;
END $$;