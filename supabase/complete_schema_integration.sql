-- ================================================================
-- SCRIPT DE INTEGRAÇÃO COMPLETA DO SCHEMA BE-FEST
-- Execute este script no SQL Editor do Supabase
-- ================================================================

-- ================================================================
-- PARTE 1: CRIAR ENUMS
-- ================================================================

-- Enum para status de usuário
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de evento
DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft', 'planning', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de serviço
DO $$ BEGIN
  CREATE TYPE service_status AS ENUM ('active', 'inactive', 'pending_approval');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de event_service
DO $$ BEGIN
  CREATE TYPE event_service_status AS ENUM ('pending_provider_approval', 'approved', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status de booking
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'paid', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ================================================================
-- PARTE 2: CRIAR/ATUALIZAR TABELAS
-- ================================================================

-- Tabela users (já existe, mas vamos garantir que tenha todos os campos)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  role user_role NOT NULL DEFAULT 'client'::user_role,
  full_name text,
  email text,
  organization_name text,
  cnpj text,
  cpf text,
  whatsapp_number text,
  logo_url text,
  area_of_operation text,
  coordenates jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_name_unique UNIQUE (name)
);

-- Tabela subcategories
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  icon_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE
);

-- Tabela events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time without time zone,
  location text,
  guest_count integer DEFAULT 0,
  budget numeric,
  status event_status DEFAULT 'draft'::event_status,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabela services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  images_urls text[],
  base_price numeric NOT NULL,
  price_per_guest numeric,
  min_guests integer DEFAULT 0,
  max_guests integer,
  status service_status DEFAULT 'active'::service_status,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabela service_guest_tiers
CREATE TABLE IF NOT EXISTS public.service_guest_tiers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  min_total_guests integer NOT NULL,
  max_total_guests integer,
  base_price_per_adult numeric NOT NULL,
  tier_description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_guest_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT service_guest_tiers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

-- Tabela service_age_pricing_rules
CREATE TABLE IF NOT EXISTS public.service_age_pricing_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  rule_description text NOT NULL,
  age_min_years integer NOT NULL,
  age_max_years integer,
  pricing_method text CHECK (pricing_method = ANY (ARRAY['fixed'::text, 'percentage'::text])),
  value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_age_pricing_rules_pkey PRIMARY KEY (id),
  CONSTRAINT service_age_pricing_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

-- Tabela service_date_surcharges
CREATE TABLE IF NOT EXISTS public.service_date_surcharges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  surcharge_description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  surcharge_type text CHECK (surcharge_type = ANY (ARRAY['fixed'::text, 'percentage'::text])),
  surcharge_value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_date_surcharges_pkey PRIMARY KEY (id),
  CONSTRAINT service_date_surcharges_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE
);

-- Tabela event_services
CREATE TABLE IF NOT EXISTS public.event_services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  service_id uuid NOT NULL,
  provider_id uuid NOT NULL,
  price_per_guest_at_booking numeric,
  befest_fee_at_booking numeric,
  total_estimated_price numeric,
  provider_notes text,
  client_notes text,
  booking_status event_service_status DEFAULT 'pending_provider_approval'::event_service_status,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT event_services_pkey PRIMARY KEY (id),
  CONSTRAINT event_services_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  CONSTRAINT event_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE,
  CONSTRAINT event_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Tabela bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  service_id uuid NOT NULL,
  status booking_status DEFAULT 'pending'::booking_status,
  price numeric NOT NULL,
  guest_count integer NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE,
  CONSTRAINT bookings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE
);

-- ================================================================
-- PARTE 3: CRIAR TRIGGERS DE UPDATED_AT
-- ================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_services_updated_at ON public.event_services;
CREATE TRIGGER update_event_services_updated_at BEFORE UPDATE ON public.event_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_guest_tiers_updated_at ON public.service_guest_tiers;
CREATE TRIGGER update_service_guest_tiers_updated_at BEFORE UPDATE ON public.service_guest_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_age_pricing_rules_updated_at ON public.service_age_pricing_rules;
CREATE TRIGGER update_service_age_pricing_rules_updated_at BEFORE UPDATE ON public.service_age_pricing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_date_surcharges_updated_at ON public.service_date_surcharges;
CREATE TRIGGER update_service_date_surcharges_updated_at BEFORE UPDATE ON public.service_date_surcharges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- PARTE 4: POLÍTICAS RLS
-- ================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_guest_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_age_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_date_surcharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for new user trigger" ON public.users;
CREATE POLICY "Enable insert for new user trigger" ON public.users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view provider profiles" ON public.users;
CREATE POLICY "Public can view provider profiles" ON public.users
  FOR SELECT USING (role = 'provider');

-- Políticas para categories (público para leitura)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para subcategories (público para leitura)
DROP POLICY IF EXISTS "Subcategories are viewable by everyone" ON public.subcategories;
CREATE POLICY "Subcategories are viewable by everyone" ON public.subcategories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage subcategories" ON public.subcategories;
CREATE POLICY "Only admins can manage subcategories" ON public.subcategories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para events
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can manage own events" ON public.events;
CREATE POLICY "Users can manage own events" ON public.events
  FOR ALL USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Providers can view events with their services" ON public.events;
CREATE POLICY "Providers can view events with their services" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.event_services es
      WHERE es.event_id = id AND es.provider_id = auth.uid()
    )
  );

-- Políticas para services
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (is_active = true AND status = 'active');

DROP POLICY IF EXISTS "Providers can manage own services" ON public.services;
CREATE POLICY "Providers can manage own services" ON public.services
  FOR ALL USING (auth.uid() = provider_id);

-- Políticas para service_guest_tiers
DROP POLICY IF EXISTS "Guest tiers are viewable by everyone" ON public.service_guest_tiers;
CREATE POLICY "Guest tiers are viewable by everyone" ON public.service_guest_tiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.is_active = true AND s.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Providers can manage own service tiers" ON public.service_guest_tiers;
CREATE POLICY "Providers can manage own service tiers" ON public.service_guest_tiers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

-- Políticas para service_age_pricing_rules
DROP POLICY IF EXISTS "Age rules are viewable by everyone" ON public.service_age_pricing_rules;
CREATE POLICY "Age rules are viewable by everyone" ON public.service_age_pricing_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.is_active = true AND s.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Providers can manage own service age rules" ON public.service_age_pricing_rules;
CREATE POLICY "Providers can manage own service age rules" ON public.service_age_pricing_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

-- Políticas para service_date_surcharges
DROP POLICY IF EXISTS "Date surcharges are viewable by everyone" ON public.service_date_surcharges;
CREATE POLICY "Date surcharges are viewable by everyone" ON public.service_date_surcharges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.is_active = true AND s.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Providers can manage own service date surcharges" ON public.service_date_surcharges;
CREATE POLICY "Providers can manage own service date surcharges" ON public.service_date_surcharges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

-- Políticas para event_services
DROP POLICY IF EXISTS "Clients can view own event services" ON public.event_services;
CREATE POLICY "Clients can view own event services" ON public.event_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Providers can view their event services" ON public.event_services;
CREATE POLICY "Providers can view their event services" ON public.event_services
  FOR SELECT USING (auth.uid() = provider_id);

DROP POLICY IF EXISTS "Clients can manage own event services" ON public.event_services;
CREATE POLICY "Clients can manage own event services" ON public.event_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Providers can update their event services" ON public.event_services;
CREATE POLICY "Providers can update their event services" ON public.event_services
  FOR UPDATE USING (auth.uid() = provider_id);

-- Políticas para bookings
DROP POLICY IF EXISTS "Clients can view own bookings" ON public.bookings;
CREATE POLICY "Clients can view own bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Providers can view their bookings" ON public.bookings;
CREATE POLICY "Providers can view their bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_id AND s.provider_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can manage own bookings" ON public.bookings;
CREATE POLICY "Clients can manage own bookings" ON public.bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id AND e.client_id = auth.uid()
    )
  );

-- ================================================================
-- PARTE 5: INSERIR DADOS INICIAIS
-- ================================================================

-- Inserir categorias padrão
INSERT INTO public.categories (name) VALUES 
  ('Buffet'),
  ('Decoração'),
  ('Música'),
  ('Fotografia'),
  ('Bebidas'),
  ('Doces'),
  ('Entretenimento'),
  ('Segurança'),
  ('Limpeza')
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- PARTE 6: VERIFICAÇÃO FINAL
-- ================================================================

DO $$ 
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Contar tabelas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('users', 'categories', 'subcategories', 'events', 'services', 'event_services', 'bookings', 'service_guest_tiers', 'service_age_pricing_rules', 'service_date_surcharges');
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Contar triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public';
  
  RAISE NOTICE '✅ Tabelas criadas: %', table_count;
  RAISE NOTICE '✅ Políticas RLS criadas: %', policy_count;
  RAISE NOTICE '✅ Triggers criados: %', trigger_count;
  RAISE NOTICE '🚀 Schema completo integrado com sucesso!';
END $$; 