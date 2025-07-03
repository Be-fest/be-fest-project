-- Script para verificar a estrutura atual do banco de dados
-- Execute este script ANTES do fix_auth_registration.sql

-- 1. Verificar se a extensão uuid-ossp está habilitada
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 2. Verificar tipos enum existentes
SELECT typname, typelem, typdelim, typinput 
FROM pg_type 
WHERE typname IN ('user_role', 'event_status', 'service_status', 'booking_status', 'event_service_status');

-- 3. Se user_role existe, mostrar valores
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    RAISE NOTICE 'Enum user_role existe com valores: %', (SELECT enum_range(NULL::user_role));
  ELSE
    RAISE NOTICE 'Enum user_role não existe';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao verificar enum user_role: %', SQLERRM;
END $$;

-- 4. Verificar se a tabela users existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- 5. Se existe, mostrar estrutura da tabela users
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    RAISE NOTICE 'Tabela users existe, mostrando estrutura:';
  ELSE
    RAISE NOTICE 'Tabela users NÃO existe - será criada do zero';
  END IF;
END $$;

-- 6. Mostrar colunas da tabela users (se existir)
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 7. Verificar constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' AND table_name = 'users';

-- 8. Verificar triggers existentes na tabela auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- 9. Verificar funções relacionadas a handle_new_user
SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines 
WHERE routine_name LIKE '%handle%' OR routine_name LIKE '%new_user%';

-- 10. Verificar políticas RLS na tabela users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- 11. Verificar se RLS está habilitado na tabela users
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  hasrls
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- 12. Mostrar usuários existentes na tabela auth.users (apenas IDs)
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 13. Se tabela public.users existe, mostrar contagem
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    SELECT COUNT(*) INTO user_count FROM public.users;
    RAISE NOTICE 'Tabela public.users tem % registros', user_count;
  ELSE
    RAISE NOTICE 'Tabela public.users não existe';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao contar registros em public.users: %', SQLERRM;
END $$;

RAISE NOTICE '=== VERIFICAÇÃO COMPLETA ===';
RAISE NOTICE 'Execute o script fix_auth_registration.sql após revisar os resultados acima.'; 