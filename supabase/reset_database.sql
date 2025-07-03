-- ⚠️  ATENÇÃO: ESTE SCRIPT APAGA TODOS OS DADOS DO BANCO! ⚠️
-- Use apenas se quiser começar do zero
-- Execute este script completo no SQL Editor do Supabase

-- ================================================================
-- PARTE 1: LIMPEZA COMPLETA (APAGA TUDO!)
-- ================================================================

-- 1. Remover todas as políticas RLS
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- 2. Remover todos os triggers do schema public
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', 
                      trigger_record.trigger_name, 
                      trigger_record.event_object_table);
    END LOOP;
END $$;

-- 3. Remover todas as funções do schema public
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', func_record.routine_name);
    END LOOP;
END $$;

-- 4. Remover todas as tabelas do schema public
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', table_record.table_name);
    END LOOP;
END $$;

-- 5. Remover todos os tipos enum
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS service_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS event_service_status CASCADE;

DO $$ BEGIN
    RAISE NOTICE '✅ Limpeza completa realizada!';
END $$;

-- ================================================================
-- PARTE 2: RECRIAÇÃO COMPLETA
-- ================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar tipos enum corretos
CREATE TYPE user_role AS ENUM ('client', 'provider');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE service_status AS ENUM ('active', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
CREATE TYPE event_service_status AS ENUM ('pending_provider_approval', 'approved', 'in_progress', 'completed', 'cancelled');

-- 3. Criar tabela de usuários
CREATE TABLE public.users (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 4. Criar tabela de categorias
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 5. Criar tabela de subcategorias
CREATE TABLE public.subcategories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  icon_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subcategories_pkey PRIMARY KEY (id),
  CONSTRAINT subcategories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);

-- 6. Criar tabela de eventos
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- 7. Criar tabela de serviços
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- 8. Criar tabela de reservas
CREATE TABLE public.bookings (
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
  CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT bookings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);

-- 9. Criar tabela de serviços por evento
CREATE TABLE public.event_services (
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
  CONSTRAINT event_services_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT event_services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.users(id)
);

-- 10. Criar tabela de níveis de convidados para serviços
CREATE TABLE public.service_guest_tiers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  min_total_guests integer NOT NULL,
  max_total_guests integer,
  base_price_per_adult numeric NOT NULL,
  tier_description text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_guest_tiers_pkey PRIMARY KEY (id),
  CONSTRAINT service_guest_tiers_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);

-- 11. Criar tabela de regras de preço por idade
CREATE TABLE public.service_age_pricing_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  rule_description text NOT NULL,
  age_min_years integer NOT NULL,
  age_max_years integer,
  pricing_method text CHECK (pricing_method IN ('fixed', 'percentage')),
  value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_age_pricing_rules_pkey PRIMARY KEY (id),
  CONSTRAINT service_age_pricing_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);

-- 12. Criar tabela de sobretaxas por data
CREATE TABLE public.service_date_surcharges (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  surcharge_description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  surcharge_type text CHECK (surcharge_type IN ('fixed', 'percentage')),
  surcharge_value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT service_date_surcharges_pkey PRIMARY KEY (id),
  CONSTRAINT service_date_surcharges_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);

-- ================================================================
-- PARTE 3: ÍNDICES
-- ================================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_cpf ON public.users(cpf);
CREATE INDEX idx_users_cnpj ON public.users(cnpj);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_events_client_id ON public.events(client_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- ================================================================
-- PARTE 4: FUNÇÕES E TRIGGERS
-- ================================================================

-- 1. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  extracted_role TEXT;
BEGIN
  -- Log dos dados recebidos para debugging
  RAISE NOTICE 'Novo usuário criado: ID=%, Email=%, Meta_data=%', NEW.id, NEW.email, NEW.raw_user_meta_data;
  
  -- Extrair e validar a role
  extracted_role := NEW.raw_user_meta_data->>'role';
  RAISE NOTICE 'Role extraída dos metadados: %', extracted_role;
  
  -- Determinar a role com fallback seguro
  IF extracted_role = 'provider' THEN
    user_role_value := 'provider'::user_role;
  ELSE
    user_role_value := 'client'::user_role;
  END IF;
  
  RAISE NOTICE 'Role final determinada: %', user_role_value;
  
  -- Inserir o usuário na tabela public.users
  INSERT INTO public.users (
    id,
    email,
    role,
    full_name,
    organization_name,
    cpf,
    cnpj,
    whatsapp_number,
    area_of_operation,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_role_value,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'organization_name',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'cnpj',
    NEW.raw_user_meta_data->>'whatsapp_number',
    NEW.raw_user_meta_data->>'area_of_operation',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Perfil de usuário criado com sucesso para: % (role: %)', NEW.email, user_role_value;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ERRO ao criar perfil para usuário % (%): SQLSTATE=%, SQLERRM=%', 
    NEW.id, NEW.email, SQLSTATE, SQLERRM;
  RAISE WARNING 'Metadados recebidos: %', NEW.raw_user_meta_data;
  -- Não falhar o processo de criação do usuário auth, apenas logar o erro
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON public.subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_services_updated_at BEFORE UPDATE ON public.event_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_guest_tiers_updated_at BEFORE UPDATE ON public.service_guest_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_age_pricing_rules_updated_at BEFORE UPDATE ON public.service_age_pricing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_date_surcharges_updated_at BEFORE UPDATE ON public.service_date_surcharges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Trigger principal para criar usuários automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- PARTE 5: RLS E POLÍTICAS
-- ================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_guest_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_age_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_date_surcharges ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for new user trigger" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para events
CREATE POLICY "Users can view own events" ON public.events
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own events" ON public.events
    FOR UPDATE USING (auth.uid() = client_id);

-- Políticas para services
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own services" ON public.services
    FOR ALL USING (auth.uid() = provider_id);

-- Políticas permissivas para outras tabelas (ajuste conforme necessário)
CREATE POLICY "Enable read access for all users" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.subcategories
    FOR SELECT USING (true);

-- ================================================================
-- PARTE 6: PERMISSIONS E DADOS INICIAIS
-- ================================================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Inserir categorias padrão
INSERT INTO public.categories (name) VALUES
    ('Buffet'),
    ('Decoração'),
    ('Fotografia'),
    ('Música'),
    ('Bebidas'),
    ('Doces'),
    ('Espaço'),
    ('Outros');

-- ================================================================
-- PARTE 7: VERIFICAÇÃO FINAL
-- ================================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabelas criadas' as status,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public';

SELECT 
    'Enums criados' as status,
    enum_range(NULL::user_role) as user_role_values;

SELECT 
    'Trigger criado' as status,
    trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 
    'Políticas RLS' as status,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public';

DO $$ BEGIN
    RAISE NOTICE '🎉 Banco de dados recriado com sucesso!';
    RAISE NOTICE '✅ Estrutura completa, triggers configurados, RLS habilitado';
    RAISE NOTICE '🚀 Teste o cadastro agora!';
END $$; 