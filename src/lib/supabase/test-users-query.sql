-- Script de teste para verificar a tabela users
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
) as table_exists;

-- 2. Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 4. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- 5. Testar query simples (substitua 'SEU_USER_ID' pelo ID real)
-- SELECT * FROM users WHERE id = 'SEU_USER_ID';

-- 6. Verificar se há dados na tabela
SELECT COUNT(*) as total_users FROM users;

-- 7. Verificar alguns registros de exemplo
SELECT id, role, full_name, email, created_at 
FROM users 
LIMIT 5;

-- 8. Se RLS estiver causando problemas, execute este comando:
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;