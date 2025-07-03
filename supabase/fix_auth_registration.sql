-- Script para corrigir problemas de autenticação e cadastro
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela users existe, se não, criar do zero
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    RAISE NOTICE 'Tabela users não existe, será criada do zero';
  ELSE
    RAISE NOTICE 'Tabela users existe, verificando estrutura';
  END IF;
END $$;

-- 2. Primeiro, vamos corrigir o enum user_role removendo 'admin'
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('client', 'provider');

-- 3. Criar/recriar a tabela users com a estrutura completa
CREATE TABLE IF NOT EXISTS public.users (
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

-- 4. Se a tabela já existia mas sem a coluna role, adicionar
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
    RAISE NOTICE 'Adicionando coluna role à tabela users existente';
    ALTER TABLE public.users ADD COLUMN role user_role NOT NULL DEFAULT 'client'::user_role;
  ELSE
    RAISE NOTICE 'Coluna role já existe, alterando tipo se necessário';
    ALTER TABLE public.users ALTER COLUMN role TYPE user_role USING role::text::user_role;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao alterar coluna role: %, ignorando...', SQLERRM;
END $$;

-- 5. Criar função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
  full_name_val text;
  organization_name_val text;
  cpf_val text;
  cnpj_val text;
  whatsapp_val text;
  area_operation_val text;
BEGIN
  -- Extrair dados dos metadados
  user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'::user_role);
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  organization_name_val := NEW.raw_user_meta_data->>'organization_name';
  cpf_val := NEW.raw_user_meta_data->>'cpf';
  cnpj_val := NEW.raw_user_meta_data->>'cnpj';
  whatsapp_val := NEW.raw_user_meta_data->>'whatsapp_number';
  area_operation_val := NEW.raw_user_meta_data->>'area_of_operation';

  -- Inserir perfil básico
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
    user_role_val,
    full_name_val,
    organization_name_val,
    cpf_val,
    cnpj_val,
    whatsapp_val,
    area_operation_val,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log do erro mas não falha o cadastro
  RAISE WARNING 'Erro ao criar perfil do usuário %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar trigger para executar a função quando usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Remover todas as políticas RLS antigas da tabela users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow signup" ON public.users;
DROP POLICY IF EXISTS "Allow user insert" ON public.users;

-- 8. Criar políticas RLS mais permissivas para resolução dos problemas
-- Permitir que qualquer usuário autenticado insira seus dados
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que usuários vejam seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Permitir que service_role acesse tudo (para admin)
CREATE POLICY "Service role can manage all" ON public.users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 9. Temporariamente desabilitar RLS para debugging se necessário
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 10. Grant permissions necessárias
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 11. Verificar se a tabela está correta
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position; 