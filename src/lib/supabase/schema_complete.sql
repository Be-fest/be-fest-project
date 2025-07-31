-- Be Fest Database Schema
-- Execute este arquivo no SQL Editor do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tipos personalizados (enums)
CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE service_status AS ENUM ('active', 'inactive');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
CREATE TYPE event_service_status AS ENUM ('pending_provider_approval', 'approved', 'in_progress', 'completed', 'cancelled');

-- Criar tabela de usuários
CREATE TABLE public.users (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client'::user_role,
  full_name text,
  email text,
  organization_name text,
  cnpj text,
  cpf text,
  whatsapp_number text,
  profile_image text,
  area_of_operation text,
  coordenates jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Criar tabela de categorias
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- Criar tabela de subcategorias
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

-- Criar tabela de eventos
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

-- Criar tabela de serviços
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

-- Criar tabela de reservas
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

-- Criar tabela de serviços por evento
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

-- Criar tabela de níveis de convidados para serviços
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

-- Criar tabela de regras de preço por idade
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

-- Criar tabela de sobretaxas por data
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

-- Criar índices para melhor performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_cpf ON public.users(cpf);
CREATE INDEX idx_users_cnpj ON public.users(cnpj);
CREATE INDEX idx_events_client_id ON public.events(client_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_category ON public.services(category);
CREATE INDEX idx_services_status ON public.services(status);
CREATE INDEX idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_event_services_event_id ON public.event_services(event_id);
CREATE INDEX idx_event_services_provider_id ON public.event_services(provider_id);
CREATE INDEX idx_event_services_booking_status ON public.event_services(booking_status);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
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

-- Habilitar RLS (Row Level Security)
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

-- Políticas de RLS básicas (ajuste conforme necessário)

-- Políticas para users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Políticas para events (exemplo)
CREATE POLICY "Users can view their own events" ON public.events
    FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create their own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = client_id);

-- Políticas para services (exemplo)
CREATE POLICY "Anyone can view active services" ON public.services
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage their own services" ON public.services
    FOR ALL USING (auth.uid() = provider_id);

-- Adicione mais políticas conforme necessário para suas regras de negócio

-- Inserir categorias padrão
INSERT INTO public.categories (name) VALUES
    ('COMIDA E BEBIDA'),
    ('ENTRETENIMENTO'),
    ('ESPAÇO'),
    ('ORGANIZAÇÃO');

-- Inserir subcategorias (assumindo que as categorias foram criadas na ordem acima)
-- COMIDA E BEBIDA subcategorias
INSERT INTO public.subcategories (category_id, name) VALUES
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Buffet'),
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Buffet de Pizzas'),
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Churrasco'),
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Confeitaria'),
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Estações de Festa'),
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Open-Bar'),
    ((SELECT id FROM public.categories WHERE name = 'COMIDA E BEBIDA'), 'Chopp');

-- ENTRETENIMENTO subcategorias  
INSERT INTO public.subcategories (category_id, name) VALUES
    ((SELECT id FROM public.categories WHERE name = 'ENTRETENIMENTO'), 'Música'),
    ((SELECT id FROM public.categories WHERE name = 'ENTRETENIMENTO'), 'DJ'),
    ((SELECT id FROM public.categories WHERE name = 'ENTRETENIMENTO'), 'Animação');

-- ESPAÇO subcategorias
INSERT INTO public.subcategories (category_id, name) VALUES
    ((SELECT id FROM public.categories WHERE name = 'ESPAÇO'), 'Salão de Festas'),
    ((SELECT id FROM public.categories WHERE name = 'ESPAÇO'), 'Espaço ao Ar Livre'),
    ((SELECT id FROM public.categories WHERE name = 'ESPAÇO'), 'Casa de Eventos');

-- ORGANIZAÇÃO subcategorias
INSERT INTO public.subcategories (category_id, name) VALUES
    ((SELECT id FROM public.categories WHERE name = 'ORGANIZAÇÃO'), 'Decoração'),
    ((SELECT id FROM public.categories WHERE name = 'ORGANIZAÇÃO'), 'Fotografia'),
    ((SELECT id FROM public.categories WHERE name = 'ORGANIZAÇÃO'), 'Segurança'),
    ((SELECT id FROM public.categories WHERE name = 'ORGANIZAÇÃO'), 'Limpeza');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;