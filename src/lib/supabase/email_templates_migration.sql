-- Migration: Create email_templates table
-- Run this in Supabase SQL Editor

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(50) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read templates (for sending emails from server)
CREATE POLICY "Anyone can read email templates"
  ON email_templates FOR SELECT
  USING (true);

-- Policy: Only authenticated users can update (will be restricted by app logic to admins)
CREATE POLICY "Authenticated users can update email templates"
  ON email_templates FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Insert default templates
INSERT INTO email_templates (type, subject, content, is_active) VALUES
(
  'welcome_client',
  'Bem-vindo à Be Fest! 🎉',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #A502CA; margin: 0;">Be Fest</h1>
    <p style="color: #666; margin: 5px 0 0 0;">Sua festa começa aqui!</p>
  </div>
  
  <h2 style="color: #333;">Olá, {{nome}}! 👋</h2>
  
  <p style="color: #555; line-height: 1.6;">
    Seja muito bem-vindo(a) à <strong style="color: #A502CA;">Be Fest</strong>! 
    Estamos muito felizes em tê-lo(a) conosco.
  </p>
  
  <p style="color: #555; line-height: 1.6;">Agora você pode:</p>
  
  <ul style="color: #555; line-height: 1.8;">
    <li>🎊 Criar e organizar suas festas</li>
    <li>🔍 Encontrar os melhores prestadores de serviços</li>
    <li>💬 Conversar diretamente com fornecedores</li>
    <li>💳 Pagar com segurança pela plataforma</li>
  </ul>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://befest.com.br/dashboard" 
       style="background: linear-gradient(135deg, #F71875, #A502CA); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              display: inline-block;">
      Acessar Minha Conta
    </a>
  </div>
  
  <p style="color: #555; line-height: 1.6;">
    Se tiver qualquer dúvida, estamos aqui para ajudar!
  </p>
  
  <p style="color: #555; margin-top: 30px;">
    Abraços,<br>
    <strong style="color: #A502CA;">Equipe Be Fest</strong>
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    Este email foi enviado para {{email}} porque você se cadastrou na Be Fest em {{data_cadastro}}.
  </p>
</div>',
  true
),
(
  'welcome_provider',
  'Bem-vindo à Be Fest! Sua jornada como prestador começa agora 🚀',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #A502CA; margin: 0;">Be Fest</h1>
    <p style="color: #666; margin: 5px 0 0 0;">Plataforma de Eventos</p>
  </div>
  
  <h2 style="color: #333;">Olá, {{nome}}! 👋</h2>
  
  <p style="color: #555; line-height: 1.6;">
    Seja muito bem-vindo(a) à <strong style="color: #A502CA;">Be Fest</strong> como prestador de serviços!
    Agora você faz parte da nossa rede de profissionais de eventos.
  </p>
  
  <p style="color: #555; line-height: 1.6;">Aqui está o que você pode fazer:</p>
  
  <ul style="color: #555; line-height: 1.8;">
    <li>📋 Cadastrar seus serviços e portfólio</li>
    <li>📊 Gerenciar solicitações de clientes</li>
    <li>💰 Receber pagamentos de forma segura</li>
    <li>💬 Conversar com clientes pelo chat</li>
    <li>⭐ Construir sua reputação na plataforma</li>
  </ul>
  
  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #333; margin-top: 0;">📌 Próximos passos:</h3>
    <ol style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
      <li>Complete seu perfil com foto e descrição</li>
      <li>Cadastre seus serviços com preços</li>
      <li>Adicione fotos do seu trabalho</li>
      <li>Aguarde as primeiras solicitações!</li>
    </ol>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://befest.com.br/dashboard/prestador" 
       style="background: linear-gradient(135deg, #F71875, #A502CA); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              display: inline-block;">
      Acessar Painel do Prestador
    </a>
  </div>
  
  <p style="color: #555; line-height: 1.6;">
    Estamos ansiosos para ver seu sucesso na plataforma!
  </p>
  
  <p style="color: #555; margin-top: 30px;">
    Abraços,<br>
    <strong style="color: #A502CA;">Equipe Be Fest</strong>
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    Este email foi enviado para {{email}} porque você se cadastrou como prestador na Be Fest em {{data_cadastro}}.
  </p>
</div>',
  true
)
ON CONFLICT (type) DO NOTHING;

-- Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_email_templates_updated_at ON email_templates;
CREATE TRIGGER trigger_update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();
