-- Script incremental para atualizar o schema do banco de dados
-- Este script é seguro para executar em produção

-- 1. Remover a coluna budget da tabela events (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'budget'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events DROP COLUMN budget;
        RAISE NOTICE 'Coluna budget removida da tabela events';
    ELSE
        RAISE NOTICE 'Coluna budget não existe na tabela events';
    END IF;
END $$;

-- 2. Remover a coluna status da tabela events (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events DROP COLUMN status;
        RAISE NOTICE 'Coluna status removida da tabela events';
    ELSE
        RAISE NOTICE 'Coluna status não existe na tabela events';
    END IF;
END $$;

-- 3. Adicionar colunas de convidados por tipo (se não existirem)
DO $$ 
BEGIN
    -- Adicionar full_guests se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'full_guests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN full_guests numeric DEFAULT 0;
        RAISE NOTICE 'Coluna full_guests adicionada à tabela events';
    ELSE
        RAISE NOTICE 'Coluna full_guests já existe na tabela events';
    END IF;

    -- Adicionar half_guests se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'half_guests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN half_guests numeric DEFAULT 0;
        RAISE NOTICE 'Coluna half_guests adicionada à tabela events';
    ELSE
        RAISE NOTICE 'Coluna half_guests já existe na tabela events';
    END IF;

    -- Adicionar free_guests se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'free_guests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.events ADD COLUMN free_guests integer DEFAULT 0;
        RAISE NOTICE 'Coluna free_guests adicionada à tabela events';
    ELSE
        RAISE NOTICE 'Coluna free_guests já existe na tabela events';
    END IF;
END $$;

-- 4. Atualizar a estrutura da tabela event_services para a nova lógica de preços
DO $$ 
BEGIN
    -- Remover colunas antigas se existirem
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services DROP COLUMN price;
        RAISE NOTICE 'Coluna price removida da tabela event_services';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'guest_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services DROP COLUMN guest_count;
        RAISE NOTICE 'Coluna guest_count removida da tabela event_services';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'notes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services DROP COLUMN notes;
        RAISE NOTICE 'Coluna notes removida da tabela event_services';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services DROP COLUMN status;
        RAISE NOTICE 'Coluna status removida da tabela event_services';
    END IF;

    -- Adicionar novas colunas se não existirem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'price_per_guest_at_booking'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services ADD COLUMN price_per_guest_at_booking numeric;
        RAISE NOTICE 'Coluna price_per_guest_at_booking adicionada à tabela event_services';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'total_estimated_price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services ADD COLUMN total_estimated_price numeric;
        RAISE NOTICE 'Coluna total_estimated_price adicionada à tabela event_services';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'event_services' 
        AND column_name = 'booking_status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.event_services ADD COLUMN booking_status event_service_status DEFAULT 'pending_provider_approval';
        RAISE NOTICE 'Coluna booking_status adicionada à tabela event_services';
    END IF;
END $$;

-- 5. Atualizar a estrutura da tabela services para a nova lógica de preços
DO $$ 
BEGIN
    -- Remover colunas antigas se existirem
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'base_price'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.services DROP COLUMN base_price;
        RAISE NOTICE 'Coluna base_price removida da tabela services';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'price_per_guest'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.services DROP COLUMN price_per_guest;
        RAISE NOTICE 'Coluna price_per_guest removida da tabela services';
    END IF;

    -- Adicionar novas colunas se não existirem
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'platform_fee_percentage'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.services ADD COLUMN platform_fee_percentage numeric DEFAULT 5.00;
        RAISE NOTICE 'Coluna platform_fee_percentage adicionada à tabela services';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'min_guests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.services ADD COLUMN min_guests integer DEFAULT 0;
        RAISE NOTICE 'Coluna min_guests adicionada à tabela services';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' 
        AND column_name = 'max_guests'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.services ADD COLUMN max_guests integer;
        RAISE NOTICE 'Coluna max_guests adicionada à tabela services';
    END IF;
END $$;

-- 6. Criar a tabela service_guest_tiers se não existir
CREATE TABLE IF NOT EXISTS public.service_guest_tiers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  min_total_guests integer NOT NULL,
  max_total_guests integer,
  base_price_per_adult numeric(10,2) NOT NULL,
  tier_description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_guest_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT service_guest_tiers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

-- 7. Adicionar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_event_services_event_id ON public.event_services(event_id);
CREATE INDEX IF NOT EXISTS idx_event_services_provider_id ON public.event_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_event_services_booking_status ON public.event_services(booking_status);
CREATE INDEX IF NOT EXISTS idx_service_guest_tiers_service_id ON public.service_guest_tiers(service_id);

-- 8. Adicionar trigger para updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_event_services_updated_at'
        AND event_object_table = 'event_services'
    ) THEN
        CREATE TRIGGER update_event_services_updated_at 
        BEFORE UPDATE ON public.event_services 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_event_services_updated_at criado';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_service_guest_tiers_updated_at'
        AND event_object_table = 'service_guest_tiers'
    ) THEN
        CREATE TRIGGER update_service_guest_tiers_updated_at 
        BEFORE UPDATE ON public.service_guest_tiers 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_service_guest_tiers_updated_at criado';
    END IF;
END $$;

-- 9. Habilitar RLS nas tabelas se não estiver habilitado
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_guest_tiers ENABLE ROW LEVEL SECURITY;

-- 10. Adicionar políticas RLS se não existirem
DO $$ 
BEGIN
    -- Políticas para events
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Clients can read their own events'
    ) THEN
        CREATE POLICY "Clients can read their own events"
        ON public.events FOR SELECT
        USING (auth.uid() = client_id);
        RAISE NOTICE 'Política RLS para events criada';
    END IF;

    -- Políticas para event_services
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_services' 
        AND policyname = 'Users can read event services they are involved with'
    ) THEN
        CREATE POLICY "Users can read event services they are involved with"
        ON public.event_services FOR SELECT
        USING (
            auth.uid() IN (
                SELECT client_id FROM public.events WHERE id = event_services.event_id
                UNION
                SELECT provider_id FROM public.event_services WHERE id = event_services.id
            )
        );
        RAISE NOTICE 'Política RLS para event_services criada';
    END IF;

    -- Políticas para service_guest_tiers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'service_guest_tiers' 
        AND policyname = 'Anyone can read service guest tiers'
    ) THEN
        CREATE POLICY "Anyone can read service guest tiers"
        ON public.service_guest_tiers FOR SELECT
        USING (true);
        RAISE NOTICE 'Política RLS para service_guest_tiers criada';
    END IF;
END $$;

-- 11. Verificar e atualizar constraints se necessário
DO $$ 
BEGIN
    -- Adicionar constraint unique para event_services se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'event_services_unique_service_per_event'
        AND table_name = 'event_services'
    ) THEN
        ALTER TABLE public.event_services 
        ADD CONSTRAINT event_services_unique_service_per_event 
        UNIQUE (event_id, service_id, provider_id);
        RAISE NOTICE 'Constraint unique para event_services adicionada';
    END IF;
END $$;

-- Fim do script incremental

-- Script para verificar e corrigir a estrutura da tabela event_services
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela event_services existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'event_services') THEN
        RAISE NOTICE 'Tabela event_services não existe. Criando...';
        
        CREATE TABLE event_services (
            id uuid default uuid_generate_v4() primary key,
            event_id uuid references events(id) on delete cascade not null,
            service_id uuid references services(id) on delete cascade not null,
            provider_id uuid references users(id) on delete cascade not null,
            price numeric(10,2) not null,
            guest_count integer,
            notes text,
            status text default 'pending' check (status in ('pending', 'waiting_payment', 'confirmed', 'completed', 'cancelled')),
            created_at timestamp with time zone default timezone('utc'::text, now()) not null,
            updated_at timestamp with time zone default timezone('utc'::text, now()) not null
        );
        
        -- Habilitar RLS
        ALTER TABLE event_services ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela event_services criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela event_services já existe';
    END IF;
END $$;

-- 2. Verificar se as colunas necessárias existem
DO $$
BEGIN
    -- Verificar se a coluna price existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'event_services' AND column_name = 'price') THEN
        RAISE NOTICE 'Coluna price não existe. Adicionando...';
        ALTER TABLE event_services ADD COLUMN price numeric(10,2) not null default 0;
    ELSE
        RAISE NOTICE 'Coluna price já existe';
    END IF;
    
    -- Verificar se a coluna guest_count existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'event_services' AND column_name = 'guest_count') THEN
        RAISE NOTICE 'Coluna guest_count não existe. Adicionando...';
        ALTER TABLE event_services ADD COLUMN guest_count integer;
    ELSE
        RAISE NOTICE 'Coluna guest_count já existe';
    END IF;
    
    -- Verificar se a coluna notes existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'event_services' AND column_name = 'notes') THEN
        RAISE NOTICE 'Coluna notes não existe. Adicionando...';
        ALTER TABLE event_services ADD COLUMN notes text;
    ELSE
        RAISE NOTICE 'Coluna notes já existe';
    END IF;
    
    -- Verificar se a coluna status existe
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'event_services' AND column_name = 'status') THEN
        RAISE NOTICE 'Coluna status não existe. Adicionando...';
        ALTER TABLE event_services ADD COLUMN status text default 'pending' check (status in ('pending', 'waiting_payment', 'confirmed', 'completed', 'cancelled'));
    ELSE
        RAISE NOTICE 'Coluna status já existe';
    END IF;
END $$;

-- 3. Verificar se as políticas RLS existem
DO $$
BEGIN
    -- Política para clientes lerem seus event services
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'event_services' AND policyname = 'Clients can read their event services') THEN
        RAISE NOTICE 'Política "Clients can read their event services" não existe. Criando...';
        CREATE POLICY "Clients can read their event services"
            ON event_services FOR SELECT
            USING (exists (
                select 1 from events
                where events.id = event_id
                and events.client_id = auth.uid()
            ));
    ELSE
        RAISE NOTICE 'Política "Clients can read their event services" já existe';
    END IF;
    
    -- Política para prestadores lerem seus event services
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'event_services' AND policyname = 'Providers can read their event services') THEN
        RAISE NOTICE 'Política "Providers can read their event services" não existe. Criando...';
        CREATE POLICY "Providers can read their event services"
            ON event_services FOR SELECT
            USING (provider_id = auth.uid());
    ELSE
        RAISE NOTICE 'Política "Providers can read their event services" já existe';
    END IF;
    
    -- Política para clientes criarem event services
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'event_services' AND policyname = 'Clients can create event services') THEN
        RAISE NOTICE 'Política "Clients can create event services" não existe. Criando...';
        CREATE POLICY "Clients can create event services"
            ON event_services FOR INSERT
            WITH CHECK (exists (
                select 1 from events
                where events.id = event_id
                and events.client_id = auth.uid()
            ));
    ELSE
        RAISE NOTICE 'Política "Clients can create event services" já existe';
    END IF;
    
    -- Política para prestadores atualizarem seus event services
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'event_services' AND policyname = 'Providers can update their event services') THEN
        RAISE NOTICE 'Política "Providers can update their event services" não existe. Criando...';
        CREATE POLICY "Providers can update their event services"
            ON event_services FOR UPDATE
            USING (provider_id = auth.uid());
    ELSE
        RAISE NOTICE 'Política "Providers can update their event services" já existe';
    END IF;
END $$;

-- 4. Verificar se há constraint única para evitar duplicatas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'event_services_unique_event_service_provider') THEN
        RAISE NOTICE 'Constraint única não existe. Criando...';
        ALTER TABLE event_services ADD CONSTRAINT event_services_unique_event_service_provider 
            UNIQUE (event_id, service_id, provider_id);
    ELSE
        RAISE NOTICE 'Constraint única já existe';
    END IF;
END $$;

-- 5. Mostrar estrutura final da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'event_services' 
ORDER BY ordinal_position;

-- 6. Mostrar políticas existentes
SELECT 
    policyname, 
    permissive, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'event_services';

-- Adicionar campo organization_description à tabela users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS organization_description text;

-- Comentário para documentar o campo
COMMENT ON COLUMN public.users.organization_description IS 'Descrição da organização/prestador de serviços';
