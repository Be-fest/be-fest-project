-- Script para testar as correções de autenticação
-- Execute após aplicar fix_auth_registration.sql

-- 1. Verificar se o enum está correto
SELECT enum_range(NULL::user_role);

-- 2. Verificar estrutura da tabela users
\d public.users

-- 3. Verificar se o trigger existe
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Verificar se a função existe
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- 5. Verificar políticas RLS da tabela users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 6. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 7. Teste de inserção manual (simular o que o trigger fará)
-- IMPORTANTE: Este INSERT será removido após o teste!
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Simular dados que viriam do auth.users
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
    test_user_id,
    'test@example.com',
    'client'::user_role,
    'Usuário Teste',
    NULL,
    '12345678901',
    NULL,
    '11999999999',
    NULL,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Teste de inserção CLIENT bem-sucedido para ID: %', test_user_id;
  
  -- Limpar dados de teste
  DELETE FROM public.users WHERE id = test_user_id;
  RAISE NOTICE 'Dados de teste CLIENT removidos';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO no teste CLIENT: %', SQLERRM;
END $$;

-- 8. Teste para prestador
DO $$
DECLARE
  test_user_id uuid := gen_random_uuid();
BEGIN
  -- Simular dados que viriam do auth.users para prestador
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
    test_user_id,
    'provider@example.com',
    'provider'::user_role,
    'Empresa Teste',
    'Empresa Teste LTDA',
    NULL,
    '12345678000199',
    '11888888888',
    'Buffet',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Teste de inserção PROVIDER bem-sucedido para ID: %', test_user_id;
  
  -- Limpar dados de teste
  DELETE FROM public.users WHERE id = test_user_id;
  RAISE NOTICE 'Dados de teste PROVIDER removidos';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO no teste PROVIDER: %', SQLERRM;
END $$; 