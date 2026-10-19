-- ============================================================================
-- MIGRAÇÃO: MÓDULO FESTMENSAGES | BE FEST
-- Descrição: Estrutura completa para modelos de mensagens, regras de automação,
-- fila assíncrona com controle de idempotência/retentativas, histórico de envios,
-- campanhas sazonais, preferências LGPD e configuração de canais.
-- ============================================================================

-- 1. Tabela de Modelos de Mensagens (Templates)
CREATE TABLE IF NOT EXISTS public.festmensages_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('operational', 'promotional')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('client', 'provider', 'both')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'both')),
  subject TEXT,
  body_text TEXT NOT NULL,
  body_html TEXT,
  whatsapp_template_name TEXT,
  whatsapp_language_code TEXT DEFAULT 'pt_BR',
  required_variables TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festmensages_templates_code ON public.festmensages_templates(code);
CREATE INDEX IF NOT EXISTS idx_festmensages_templates_recipient ON public.festmensages_templates(recipient_type, is_active);

-- 2. Tabela de Regras de Automação (Rules)
CREATE TABLE IF NOT EXISTS public.festmensages_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('client', 'provider', 'both')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'both')),
  template_code TEXT NOT NULL REFERENCES public.festmensages_templates(code) ON UPDATE CASCADE,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  allow_repeat BOOLEAN NOT NULL DEFAULT false,
  cooldown_hours INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festmensages_rules_event_type ON public.festmensages_rules(event_type, is_active);

-- 3. Tabela de Fila de Notificações e Controle de Duplicidade (Queue)
CREATE TABLE IF NOT EXISTS public.festmensages_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  entity_id TEXT,
  rule_code TEXT,
  template_code TEXT NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('client', 'provider')),
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  category TEXT NOT NULL DEFAULT 'operational' CHECK (category IN ('operational', 'promotional')),
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  rendered_subject TEXT,
  rendered_body_text TEXT,
  rendered_body_html TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'sent', 'failed', 'cancelled', 'skipped', 'test_mode_logged')
  ),
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  provider_name TEXT,
  provider_message_id TEXT,
  delivery_status TEXT,
  is_test BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festmensages_queue_status_sched ON public.festmensages_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_festmensages_queue_retry ON public.festmensages_queue(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_festmensages_queue_recipient ON public.festmensages_queue(recipient_id, event_type);
CREATE INDEX IF NOT EXISTS idx_festmensages_queue_created ON public.festmensages_queue(created_at DESC);

-- 4. Tabela de Histórico e Tentativas de Envio (Logs)
CREATE TABLE IF NOT EXISTS public.festmensages_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES public.festmensages_queue(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  template_code TEXT NOT NULL,
  recipient_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('client', 'provider')),
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status TEXT NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  provider_name TEXT,
  provider_message_id TEXT,
  delivery_status TEXT,
  error_message TEXT,
  is_test BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festmensages_logs_created ON public.festmensages_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_festmensages_logs_status ON public.festmensages_logs(status, channel);
CREATE INDEX IF NOT EXISTS idx_festmensages_logs_recipient ON public.festmensages_logs(recipient_email, recipient_phone);

-- 5. Tabela de Campanhas Sazonais e de Relacionamento (Campaigns)
CREATE TABLE IF NOT EXISTS public.festmensages_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (
    campaign_type IN ('seasonality', 'points_coupons', 'inactive_clients', 'inactive_providers', 'festplus', 'provider_campaign')
  ),
  target_audience TEXT NOT NULL CHECK (
    target_audience IN ('all_clients', 'inactive_clients', 'all_providers', 'inactive_providers', 'festplus_eligible')
  ),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'both')),
  template_code TEXT NOT NULL REFERENCES public.festmensages_templates(code) ON UPDATE CASCADE,
  custom_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  inactive_days_threshold INTEGER DEFAULT 60,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')
  ),
  total_eligible INTEGER NOT NULL DEFAULT 0,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_failed INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festmensages_campaigns_status ON public.festmensages_campaigns(status, start_date, end_date);

-- 6. Tabela de Consentimento e Preferências de Comunicação (LGPD)
CREATE TABLE IF NOT EXISTS public.festmensages_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  phone TEXT,
  operational_email BOOLEAN NOT NULL DEFAULT true,
  operational_whatsapp BOOLEAN NOT NULL DEFAULT true,
  promotional_email BOOLEAN NOT NULL DEFAULT true,
  promotional_whatsapp BOOLEAN NOT NULL DEFAULT true,
  consent_source TEXT NOT NULL DEFAULT 'platform_registration',
  consent_purpose TEXT NOT NULL DEFAULT 'order_updates_and_platform_communications',
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_festmensages_prefs_user ON public.festmensages_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_festmensages_prefs_email ON public.festmensages_preferences(email);

-- 7. Tabela de Configurações de Canais (Channel Configs)
CREATE TABLE IF NOT EXISTS public.festmensages_channel_configs (
  channel TEXT PRIMARY KEY CHECK (channel IN ('email', 'whatsapp')),
  provider_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  test_mode BOOLEAN NOT NULL DEFAULT false,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  config_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.festmensages_channel_configs (channel, provider_name, is_enabled, test_mode, rate_limit_per_minute, config_metadata)
VALUES
  ('email', 'resend', true, false, 100, '{"from_env_var": "RESEND_FROM_EMAIL", "api_key_env_var": "RESEND_API_KEY"}'::jsonb),
  ('whatsapp', 'whatsapp_cloud_api', true, false, 60, '{"phone_id_env_var": "WHATSAPP_PHONE_NUMBER_ID", "token_env_var": "WHATSAPP_ACCESS_TOKEN", "api_url_env_var": "WHATSAPP_API_URL"}'::jsonb)
ON CONFLICT (channel) DO NOTHING;

-- Habilitar RLS nas novas tabelas (acesso exclusivo via service_role / Admin)
ALTER TABLE public.festmensages_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festmensages_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festmensages_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festmensages_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festmensages_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festmensages_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.festmensages_channel_configs ENABLE ROW LEVEL SECURITY;
