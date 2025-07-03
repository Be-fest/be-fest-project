-- ================================================================
-- SCRIPT DE DEBUG PARA IDENTIFICAR PROBLEMAS NA FUNÇÃO
-- ================================================================
-- Execute este script para diagnosticar o problema atual

-- ================================================================
-- PARTE 1: VERIFICAR ESTADO ATUAL
-- ================================================================

-- Verificar se a função existe
DO $$
DECLARE
  function_exists BOOLEAN;
  trigger_exists BOOLEAN;
BEGIN
  RAISE NOTICE '=== DIAGNÓSTICO DO SISTEMA ===';
  
  -- Verificar função
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO function_exists;
  
  -- Verificar trigger
  SELECT EXISTS(
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) INTO trigger_exists;
  
  RAISE NOTICE 'Função handle_new_user existe: %', function_exists;
  RAISE NOTICE 'Trigger on_auth_user_created existe: %', trigger_exists;
  
  -- Verificar estrutura da tabela users
  RAISE NOTICE 'Verificando estrutura da tabela users...';
  
  -- Listar colunas da tabela users
  FOR rec IN (
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
    ORDER BY ordinal_position
  ) LOOP
    RAISE NOTICE 'Coluna: % (tipo: %, nullable: %)', rec.column_name, rec.data_type, rec.is_nullable;
  END LOOP;
  
  -- Verificar enum user_role
  RAISE NOTICE 'Valores do enum user_role: %', enum_range(NULL::user_role);
  
END $$;

-- ================================================================
-- PARTE 2: VERIFICAR POLÍTICAS RLS
-- ================================================================

-- Listar todas as políticas na tabela users
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  RAISE NOTICE '=== POLÍTICAS RLS NA TABELA USERS ===';
  
  FOR policy_rec IN (
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
  ) LOOP
    RAISE NOTICE 'Política: % (comando: %)', policy_rec.policyname, policy_rec.cmd;
  END LOOP;
  
END $$;

-- ================================================================
-- PARTE 3: TESTE SIMPLES DA FUNÇÃO
-- ================================================================

DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    inserted_count INTEGER;
    error_occurred BOOLEAN := false;
BEGIN
    RAISE NOTICE '=== TESTE SIMPLES DA FUNÇÃO ===';
    
    BEGIN
        -- Tentar inserir um usuário de teste
        RAISE NOTICE 'Inserindo usuário de teste...';
        
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
            'debug_test@exemplo.com',
            jsonb_build_object(
                'role', 'client',
                'full_name', 'Teste Debug',
                'cpf', '12345678901',
                'whatsapp_number', '11999999999'
            ),
            NOW(),
            NOW(),
            NOW(),
            '00000000-0000-0000-0000-000000000000'
        );
        
        RAISE NOTICE 'Usuário inserido em auth.users com sucesso!';
        
        -- Verificar se foi criado em public.users
        SELECT COUNT(*) INTO inserted_count
        FROM public.users 
        WHERE id = test_user_id;
        
        IF inserted_count = 1 THEN
            RAISE NOTICE '✅ SUCESSO! Usuário criado em public.users via trigger.';
        ELSE
            RAISE NOTICE '❌ FALHA! Usuário não foi criado em public.users.';
            error_occurred := true;
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO durante o teste:';
        RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
        RAISE NOTICE 'SQLERRM: %', SQLERRM;
        RAISE NOTICE 'CONTEXT: %', PG_EXCEPTION_CONTEXT();
        error_occurred := true;
    END;
    
    -- Limpar dados de teste
    BEGIN
        DELETE FROM auth.users WHERE id = test_user_id;
        DELETE FROM public.users WHERE id = test_user_id;
        RAISE NOTICE 'Dados de teste removidos.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao limpar dados de teste: %', SQLERRM;
    END;
    
    IF error_occurred THEN
        RAISE NOTICE '⚠️  PROBLEMA IDENTIFICADO! Verifique os erros acima.';
    ELSE
        RAISE NOTICE '🎉 Sistema funcionando corretamente!';
    END IF;
    
END $$;

-- ================================================================
-- PARTE 4: VERIFICAR PERMISSÕES
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '=== VERIFICANDO PERMISSÕES ===';
  
  -- Verificar se a função tem SECURITY DEFINER
  IF EXISTS(
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'handle_new_user'
    AND p.prosecdef = true
  ) THEN
    RAISE NOTICE '✅ Função tem SECURITY DEFINER';
  ELSE
    RAISE NOTICE '❌ Função NÃO tem SECURITY DEFINER';
  END IF;
  
  -- Verificar grants na tabela users
  RAISE NOTICE 'Verificando grants na tabela users...';
  
END $$;

-- ================================================================
-- PARTE 5: MOSTRAR CÓDIGO DA FUNÇÃO ATUAL
-- ================================================================

DO $$
DECLARE
  function_def TEXT;
BEGIN
  RAISE NOTICE '=== CÓDIGO DA FUNÇÃO ATUAL ===';
  
  SELECT pg_get_functiondef(oid) INTO function_def
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_user';
  
  IF function_def IS NOT NULL THEN
    RAISE NOTICE 'Função encontrada. Tamanho do código: % caracteres', length(function_def);
    -- Não vou mostrar o código completo aqui pois pode ser muito longo
  ELSE
    RAISE NOTICE '❌ Função handle_new_user NÃO encontrada!';
  END IF;
  
END $$;

RAISE NOTICE '=== DIAGNÓSTICO COMPLETO ===';
RAISE NOTICE 'Execute este script e analise os resultados para identificar o problema.'; 