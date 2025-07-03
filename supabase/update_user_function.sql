-- Script para atualizar APENAS a função handle_new_user e políticas
-- Execute este script no SQL Editor do Supabase

-- ================================================================
-- PARTE 1: ATUALIZAR A FUNÇÃO handle_new_user
-- ================================================================

-- Remover a função anterior
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar a função corrigida com logs detalhados
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

-- ================================================================
-- PARTE 2: RECRIAR O TRIGGER
-- ================================================================

-- Remover trigger anterior se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar o trigger novamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- PARTE 3: ADICIONAR POLÍTICA PERMISSIVA PARA TRIGGER
-- ================================================================

-- Adicionar política para permitir inserções via trigger
DO $$
BEGIN
  -- Verificar se a política já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Enable insert for new user trigger'
  ) THEN
    -- Criar a política se não existir
    EXECUTE 'CREATE POLICY "Enable insert for new user trigger" ON public.users FOR INSERT WITH CHECK (true)';
    RAISE NOTICE 'Política "Enable insert for new user trigger" criada com sucesso!';
  ELSE
    RAISE NOTICE 'Política "Enable insert for new user trigger" já existe.';
  END IF;
END $$;

-- ================================================================
-- PARTE 4: VERIFICAÇÃO
-- ================================================================

-- Verificar se tudo foi criado corretamente
DO $$ 
DECLARE
  trigger_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Contar triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created';
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'users';
  
  RAISE NOTICE '✅ Função handle_new_user atualizada!';
  RAISE NOTICE '✅ Trigger on_auth_user_created: % encontrado(s)', trigger_count;
  RAISE NOTICE '✅ Políticas na tabela users: %', policy_count;
  RAISE NOTICE '🚀 Sistema pronto para teste de cadastro!';
END $$; 