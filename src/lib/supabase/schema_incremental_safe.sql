-- Be Fest - Schema Incremental SEGURO
-- Este script só adiciona o que não existe, preservando dados atuais

-- 1. Verificar e criar extensões se não existirem
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verificar e criar tipos personalizados se não existirem
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_service_status AS ENUM ('pending_provider_approval', 'approved', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Adicionar colunas que podem estar faltando na tabela events (se não existirem)
DO $$ 
BEGIN
    -- Verificar se as colunas de convidados existem, se não, adicionar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'full_guests') THEN
        ALTER TABLE public.events ADD COLUMN full_guests integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'half_guests') THEN
        ALTER TABLE public.events ADD COLUMN half_guests integer DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'free_guests') THEN
        ALTER TABLE public.events ADD COLUMN free_guests integer DEFAULT 0;
    END IF;
END $$;

-- 4. Verificar e criar índices se não existirem
DO $$ 
BEGIN
    -- Índices para users
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON public.users(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_cpf') THEN
        CREATE INDEX idx_users_cpf ON public.users(cpf);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_cnpj') THEN
        CREATE INDEX idx_users_cnpj ON public.users(cnpj);
    END IF;
    
    -- Índices para events
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_client_id') THEN
        CREATE INDEX idx_events_client_id ON public.events(client_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_status') THEN
        CREATE INDEX idx_events_status ON public.events(status);
    END IF;
    
    -- Índices para services
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_provider_id') THEN
        CREATE INDEX idx_services_provider_id ON public.services(provider_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_category') THEN
        CREATE INDEX idx_services_category ON public.services(category);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_services_status') THEN
        CREATE INDEX idx_services_status ON public.services(status);
    END IF;
    
    -- Índices para bookings
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_event_id') THEN
        CREATE INDEX idx_bookings_event_id ON public.bookings(event_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_service_id') THEN
        CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_status') THEN
        CREATE INDEX idx_bookings_status ON public.bookings(status);
    END IF;
    
    -- Índices para event_services
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_services_event_id') THEN
        CREATE INDEX idx_event_services_event_id ON public.event_services(event_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_services_provider_id') THEN
        CREATE INDEX idx_event_services_provider_id ON public.event_services(provider_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_event_services_booking_status') THEN
        CREATE INDEX idx_event_services_booking_status ON public.event_services(booking_status);
    END IF;
END $$;

-- 5. Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar triggers se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
        CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subcategories_updated_at') THEN
        CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
        CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_updated_at') THEN
        CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_event_services_updated_at') THEN
        CREATE TRIGGER update_event_services_updated_at BEFORE UPDATE ON public.event_services
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_guest_tiers_updated_at') THEN
        CREATE TRIGGER update_service_guest_tiers_updated_at BEFORE UPDATE ON public.service_guest_tiers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_age_pricing_rules_updated_at') THEN
        CREATE TRIGGER update_service_age_pricing_rules_updated_at BEFORE UPDATE ON public.service_age_pricing_rules
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_date_surcharges_updated_at') THEN
        CREATE TRIGGER update_service_date_surcharges_updated_at BEFORE UPDATE ON public.service_date_surcharges
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Inserir categorias APENAS se não existirem
INSERT INTO public.categories (name) 
SELECT * FROM (VALUES 
    ('COMIDA E BEBIDA'),
    ('ENTRETENIMENTO'),
    ('ESPAÇO'),
    ('ORGANIZAÇÃO')
) AS new_categories(name)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories WHERE name = new_categories.name
);

-- 8. Inserir subcategorias APENAS se não existirem
-- COMIDA E BEBIDA subcategorias
INSERT INTO public.subcategories (category_id, name)
SELECT category_id, name FROM (
    SELECT 
        (SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA') as category_id,
        unnest(ARRAY['Buffet', 'Buffet de Pizzas', 'Churrasco', 'Confeitaria', 'Estações de Festa', 'Open-Bar', 'Chopp']) as name
) AS new_subcategories
WHERE NOT EXISTS (
    SELECT 1 FROM public.subcategories s 
    WHERE s.category_id = new_subcategories.category_id 
    AND s.name = new_subcategories.name
);

-- ENTRETENIMENTO subcategorias
INSERT INTO public.subcategories (category_id, name)
SELECT category_id, name FROM (
    SELECT 
        (SELECT id FROM public.categories WHERE name = 'ENTRETENIMENTO') as category_id,
        unnest(ARRAY['Música', 'DJ', 'Animação']) as name
) AS new_subcategories
WHERE NOT EXISTS (
    SELECT 1 FROM public.subcategories s 
    WHERE s.category_id = new_subcategories.category_id 
    AND s.name = new_subcategories.name
);

-- ESPAÇO subcategorias
INSERT INTO public.subcategories (category_id, name)
SELECT category_id, name FROM (
    SELECT 
        (SELECT id FROM public.categories WHERE name = 'ESPAÇO') as category_id,
        unnest(ARRAY['Salão de Festas', 'Espaço ao Ar Livre', 'Casa de Eventos']) as name
) AS new_subcategories
WHERE NOT EXISTS (
    SELECT 1 FROM public.subcategories s 
    WHERE s.category_id = new_subcategories.category_id 
    AND s.name = new_subcategories.name
);

-- ORGANIZAÇÃO subcategorias
INSERT INTO public.subcategories (category_id, name)
SELECT category_id, name FROM (
    SELECT 
        (SELECT id FROM public.categories WHERE name = 'ORGANIZAÇÃO') as category_id,
        unnest(ARRAY['Decoração', 'Fotografia', 'Segurança', 'Limpeza']) as name
) AS new_subcategories
WHERE NOT EXISTS (
    SELECT 1 FROM public.subcategories s 
    WHERE s.category_id = new_subcategories.category_id 
    AND s.name = new_subcategories.name
);

-- 9. Confirmar permissões (idempotente)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
