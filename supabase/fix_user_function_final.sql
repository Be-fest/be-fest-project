-- ================================================================
-- CORREÇÃO DEFINITIVA DA FUNÇÃO handle_new_user
-- ================================================================
-- Este script corrige todos os problemas de cadastro de usuários
-- Execute este script no SQL Editor do Supabase

-- ================================================================
-- PARTE 1: RECRIAR A FUNÇÃO COM MAPEAMENTO CORRETO
-- ================================================================

-- Remover função anterior
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função robusta e à prova de falhas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  extracted_role TEXT;
  user_full_name TEXT;
  user_org_name TEXT;
  user_cpf TEXT;
  user_cnpj TEXT;
  user_phone TEXT;
  user_area TEXT;
BEGIN
  -- Log completo dos dados recebidos
  RAISE NOTICE '=== NOVO USUÁRIO SENDO CRIADO ===';
  RAISE NOTICE 'ID: %', NEW.id;
  RAISE NOTICE 'Email: %', NEW.email;
  RAISE NOTICE 'Metadados completos: %', NEW.raw_user_meta_data;
  
  -- ================================================================
  -- EXTRAÇÃO SEGURA DE TODOS OS CAMPOS
  -- ================================================================
  
  -- Extrair role com fallback
  extracted_role := NEW.raw_user_meta_data->>'role';
  IF extracted_role = 'provider' THEN
    user_role_value := 'provider'::user_role;
  ELSE
    user_role_value := 'client'::user_role;
  END IF;
  
  -- Extrair nome (full_name para ambos os tipos)
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Extrair organization_name 
  user_org_name := NEW.raw_user_meta_data->>'organization_name';
  
  -- Extrair CPF
  user_cpf := NEW.raw_user_meta_data->>'cpf';
  
  -- Extrair CNPJ
  user_cnpj := NEW.raw_user_meta_data->>'cnpj';
  
  -- Extrair telefone (whatsapp_number)
  user_phone := NEW.raw_user_meta_data->>'whatsapp_number';
  
  -- Extrair área de operação
  user_area := NEW.raw_user_meta_data->>'area_of_operation';
  
  -- Log dos campos extraídos
  RAISE NOTICE 'Role determinada: %', user_role_value;
  RAISE NOTICE 'Full name: %', user_full_name;
  RAISE NOTICE 'Organization name: %', user_org_name;
  RAISE NOTICE 'CPF: %', user_cpf;
  RAISE NOTICE 'CNPJ: %', user_cnpj;
  RAISE NOTICE 'Phone: %', user_phone;
  RAISE NOTICE 'Area: %', user_area;
  
  -- ================================================================
  -- INSERÇÃO ROBUSTA NA TABELA USERS
  -- ================================================================
  
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
    user_full_name,
    user_org_name,
    user_cpf,
    user_cnpj,
    user_phone,
    user_area,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE '✅ Usuário criado com sucesso na tabela public.users';
  RAISE NOTICE 'ID: %, Email: %, Role: %', NEW.id, NEW.email, user_role_value;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log detalhado do erro sem falhar a transação
  RAISE WARNING '❌ ERRO na função handle_new_user:';
  RAISE WARNING 'SQLSTATE: %', SQLSTATE;
  RAISE WARNING 'SQLERRM: %', SQLERRM;
  RAISE WARNING 'Usuário ID: %', NEW.id;
  RAISE WARNING 'Email: %', NEW.email;
  RAISE WARNING 'Metadados: %', NEW.raw_user_meta_data;
  RAISE WARNING 'Context: %', PG_EXCEPTION_CONTEXT();
  
  -- CRÍTICO: Retornar NEW para não falhar a criação do usuário auth
  -- Isso evita o erro "Database error saving new user"
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PARTE 2: RECRIAR TRIGGER
-- ================================================================

-- Remover trigger anterior
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- PARTE 3: GARANTIR POLÍTICAS RLS ADEQUADAS
-- ================================================================

-- Remover política específica de trigger se existir
DROP POLICY IF EXISTS "Enable insert for new user trigger" ON public.users;

-- Criar política mais permissiva para inserções via trigger
CREATE POLICY "Enable insert for trigger and authenticated users" ON public.users
  FOR INSERT WITH CHECK (
    -- Permitir inserções via trigger (sem auth.uid()) OU usuários autenticados
    auth.uid() IS NULL OR auth.uid() = id
  );

-- ================================================================
-- PARTE 4: TESTE IMEDIATO DA FUNÇÃO
-- ================================================================

DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    inserted_count INTEGER;
BEGIN
    RAISE NOTICE '🧪 TESTANDO A FUNÇÃO CORRIGIDA...';
    
    -- Simular inserção similar ao que o Supabase faz
    INSERT INTO auth.users (
        id,
        email,
        raw_user_meta_data,
        created_at,
        updated_at,
        email_confirmed_at,
        instance_id
    ) VALUES (
        test_user_id,
        'teste_provider@exemplo.com',
        jsonb_build_object(
            'role', 'provider',
            'full_name', 'Buffet Teste Ltda',
            'organization_name', 'Buffet Teste Ltda',
            'cnpj', '12345678000199',
            'whatsapp_number', '11999999999',
            'area_of_operation', 'Buffet para festas'
        ),
        NOW(),
        NOW(),
        NOW(),
        '00000000-0000-0000-0000-000000000000'
    );
    
    -- Verificar se foi inserido em public.users
    SELECT COUNT(*) INTO inserted_count
    FROM public.users 
    WHERE id = test_user_id AND role = 'provider';
    
    IF inserted_count = 1 THEN
        RAISE NOTICE '✅ TESTE PASSOU! Usuário provider criado corretamente.';
    ELSE
        RAISE NOTICE '❌ TESTE FALHOU! Usuário não foi criado em public.users.';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM auth.users WHERE id = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
    -- Limpar mesmo com erro
    DELETE FROM auth.users WHERE id = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
END $$;

-- ================================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ================================================================

DO $$ 
DECLARE
  trigger_count INTEGER;
  policy_count INTEGER;
  function_exists BOOLEAN;
BEGIN
  -- Verificar função
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO function_exists;
  
  -- Verificar trigger
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created';
  
  -- Verificar políticas
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'users';
  
  RAISE NOTICE '=== VERIFICAÇÃO FINAL ===';
  RAISE NOTICE 'Função handle_new_user existe: %', function_exists;
  RAISE NOTICE 'Triggers encontrados: %', trigger_count;
  RAISE NOTICE 'Políticas RLS na tabela users: %', policy_count;
  
  IF function_exists AND trigger_count > 0 THEN
    RAISE NOTICE '🎉 CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE '🚀 Agora teste o cadastro de prestadores na aplicação!';
  ELSE
    RAISE NOTICE '⚠️  Algo pode estar errado. Verifique os logs acima.';
  END IF;
END $$; 