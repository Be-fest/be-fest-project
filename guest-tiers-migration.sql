-- Adicionar suporte para faixas de preços avançadas e taxa Be Fest

-- Verificar se a tabela service_guest_tiers já existe, caso contrário criar
CREATE TABLE IF NOT EXISTS service_guest_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  min_total_guests INTEGER NOT NULL,
  max_total_guests INTEGER,
  base_price_per_adult DECIMAL(10,2) NOT NULL DEFAULT 0,
  tier_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_service_guest_tiers_service_id ON service_guest_tiers(service_id);
CREATE INDEX IF NOT EXISTS idx_service_guest_tiers_guests_range ON service_guest_tiers(min_total_guests, max_total_guests);

-- Adicionar coluna para armazenar a taxa da plataforma (Be Fest) nos serviços se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'services' AND column_name = 'platform_fee_percentage') THEN
        ALTER TABLE services ADD COLUMN platform_fee_percentage DECIMAL(5,2) DEFAULT 5.00;
    END IF;
END$$;

-- Adicionar comentários para documentar
COMMENT ON TABLE service_guest_tiers IS 'Faixas de preços por número de convidados para cada serviço';
COMMENT ON COLUMN service_guest_tiers.min_total_guests IS 'Número mínimo de convidados para esta faixa';
COMMENT ON COLUMN service_guest_tiers.max_total_guests IS 'Número máximo de convidados para esta faixa (NULL = sem limite)';
COMMENT ON COLUMN service_guest_tiers.base_price_per_adult IS 'Preço base por adulto nesta faixa (antes da taxa Be Fest)';
COMMENT ON COLUMN service_guest_tiers.tier_description IS 'Descrição da faixa (ex: Festa Pequena, Festa Média)';

COMMENT ON COLUMN services.platform_fee_percentage IS 'Percentual da taxa da plataforma Be Fest (padrão 5%)';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_service_guest_tiers_updated_at') THEN
        CREATE TRIGGER update_service_guest_tiers_updated_at 
            BEFORE UPDATE ON service_guest_tiers 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END$$;

-- Política RLS para service_guest_tiers (se RLS estiver habilitado)
ALTER TABLE service_guest_tiers ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem e criar novas
DROP POLICY IF EXISTS "Providers can manage their own service guest tiers" ON service_guest_tiers;
DROP POLICY IF EXISTS "Clients can view service guest tiers" ON service_guest_tiers;

-- Permitir que prestadores vejam e gerenciem apenas suas próprias faixas de preços
CREATE POLICY "Providers can manage their own service guest tiers" ON service_guest_tiers
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM services 
            WHERE services.id = service_guest_tiers.service_id 
            AND services.provider_id = auth.uid()
        )
    );

-- Permitir que clientes vejam as faixas de preços dos serviços
CREATE POLICY "Clients can view service guest tiers" ON service_guest_tiers
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM services 
            WHERE services.id = service_guest_tiers.service_id 
            AND services.is_active = true 
            AND services.status = 'active'
        )
    );
