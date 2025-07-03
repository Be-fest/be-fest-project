-- Script para testar a função handle_new_user atualizada
-- Execute este script após aplicar as correções

-- ================================================================
-- TESTE 1: Simular criação de usuário CLIENT
-- ================================================================
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    RAISE NOTICE 'TESTE 1: Simulando criação de usuário CLIENT...';
    
    -- Simular inserção de usuário auth com metadados de client
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
        'cliente_teste@exemplo.com',
        jsonb_build_object(
            'role', 'client',
            'full_name', 'João da Silva',
            'cpf', '12345678901',
            'whatsapp_number', '11999999999'
        ),
        NOW(),
        NOW(),
        NOW(),
        '00000000-0000-0000-0000-000000000000'
    );
    
    -- Verificar se foi criado na tabela public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_user_id AND role = 'client') THEN
        RAISE NOTICE 'Teste CLIENT bem-sucedido! Usuário criado com role client.';
    ELSE
        RAISE NOTICE 'FALHA no teste CLIENT! Usuário não foi criado ou role incorreta.';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM auth.users WHERE id = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'Dados de teste CLIENT removidos';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO no teste CLIENT: %', SQLERRM;
    -- Tentar limpar mesmo em caso de erro
    DELETE FROM auth.users WHERE id = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
END $$;

-- ================================================================
-- TESTE 2: Simular criação de usuário PROVIDER
-- ================================================================
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    RAISE NOTICE 'TESTE 2: Simulando criação de usuário PROVIDER...';
    
    -- Simular inserção de usuário auth com metadados de provider
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
        'provider_teste@exemplo.com',
        jsonb_build_object(
            'role', 'provider',
            'full_name', 'Buffet Exemplo',
            'organization_name', 'Buffet Exemplo Ltda',
            'cnpj', '12345678000199',
            'whatsapp_number', '11888888888',
            'area_of_operation', 'Buffet para eventos'
        ),
        NOW(),
        NOW(),
        NOW(),
        '00000000-0000-0000-0000-000000000000'
    );
    
    -- Verificar se foi criado na tabela public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_user_id AND role = 'provider') THEN
        RAISE NOTICE 'Teste PROVIDER bem-sucedido! Usuário criado com role provider.';
    ELSE
        RAISE NOTICE 'FALHA no teste PROVIDER! Usuário não foi criado ou role incorreta.';
    END IF;
    
    -- Limpar dados de teste
    DELETE FROM auth.users WHERE id = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'Dados de teste PROVIDER removidos';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO no teste PROVIDER: %', SQLERRM;
    -- Tentar limpar mesmo em caso de erro
    DELETE FROM auth.users WHERE id = test_user_id;
    DELETE FROM public.users WHERE id = test_user_id;
END $$;

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================
DO $$ BEGIN
    RAISE NOTICE '✅ Testes da função handle_new_user concluídos!';
    RAISE NOTICE '🔍 Verifique os logs acima para confirmar que ambos os testes passaram.';
    RAISE NOTICE '🚀 Agora teste o cadastro real na aplicação!';
END $$; 