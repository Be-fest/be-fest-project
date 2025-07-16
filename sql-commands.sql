-- Execute estes comandos no painel do Supabase (SQL Editor)

-- 1. Adicionar coluna profile_image se não existir
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- 2. Verificar dados atuais dos prestadores
SELECT 
  id, 
  organization_name, 
  full_name, 
  area_of_operation, 
  cnpj, 
  whatsapp_number,
  profile_image,
  email
FROM public.users 
WHERE role = 'provider'; 