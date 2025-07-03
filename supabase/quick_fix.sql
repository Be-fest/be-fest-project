-- Script de correção rápida para problemas de autenticação
-- Use este script se o fix_auth_registration.sql der erro

-- 1. Habilitar extensão necessária
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Criar enum correto (sem admin)
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('client', 'provider');

-- 3. Deletar tabela users se existir (CUIDADO: isso apaga todos os dados!)
-- Descomente a linha abaixo APENAS se não houver dados importantes
-- DROP TABLE IF EXISTS public.users CASCADE;

-- 4. Criar tabela users do zero
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
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 5. Adicionar foreign key constraint para auth.users
DO $$
BEGIN
  -- Só adiciona a constraint se ela não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' 
    AND table_name = 'users' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Criar função de trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'organization_name',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'cnpj',
    NEW.raw_user_meta_data->>'whatsapp_number',
    NEW.raw_user_meta_data->>'area_of_operation',
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log erro mas não falha o cadastro
  RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 9. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all" ON public.users;

-- 10. Criar políticas simples
CREATE POLICY "Enable all for authenticated users" ON public.users
  FOR ALL USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'service_role');

-- 11. Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 12. Verificar se tudo está OK
SELECT 
  'Tabela criada' as status,
  COUNT(*) as colunas 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users';

SELECT 
  'Trigger criado' as status,
  trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 
  'Enum criado' as status,
  enum_range(NULL::user_role) as valores;

RAISE NOTICE 'Correção rápida concluída! Teste o cadastro agora.'; 