-- Políticas RLS para a tabela users
-- Execute este script no SQL Editor do Supabase

-- TEMPORÁRIO: Desabilitar RLS para teste
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 1. Habilitar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Política para permitir que usuários vejam seus próprios dados
CREATE POLICY "Users can view own profile" ON users
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 3. Política para permitir que usuários atualizem seus próprios dados
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. Política para permitir que usuários insiram seus próprios dados (criação de perfil)
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 5. Política para permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all users" ON users
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Política para permitir que admins atualizem todos os usuários
CREATE POLICY "Admins can update all users" ON users
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. Política para permitir acesso público a dados básicos de prestadores (para exibição de serviços)
CREATE POLICY "Public can view provider basic info" ON users
FOR SELECT 
TO public 
USING (role = 'provider');

-- Verificar se as políticas foram criadas corretamente
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'users';

-- COMANDO PARA DESABILITAR RLS TEMPORARIAMENTE (execute se necessário):
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;