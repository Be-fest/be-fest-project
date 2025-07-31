-- Adicionar campos de coordenadas na tabela events
ALTER TABLE public.events 
ADD COLUMN event_latitude DECIMAL(10, 8),
ADD COLUMN event_longitude DECIMAL(11, 8);

-- Criar índice espacial para as coordenadas dos eventos
CREATE INDEX IF NOT EXISTS idx_events_location ON public.events(event_latitude, event_longitude);

-- Comentários sobre os campos
COMMENT ON COLUMN public.events.event_latitude IS 'Latitude do local do evento (obtida via geocoding)';
COMMENT ON COLUMN public.events.event_longitude IS 'Longitude do local do evento (obtida via geocoding)';