-- Políticas para o bucket be-fest-images
-- Execute este SQL no painel do Supabase ou via SQL Editor

-- 1. Garantir que o bucket existe e é público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'be-fest-images', 
  'be-fest-images', 
  true, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Remover todas as políticas existentes para começar limpo
DROP POLICY IF EXISTS "Usuários podem fazer upload nas suas pastas" ON storage.objects;
DROP POLICY IF EXISTS "Acesso público para visualização" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus arquivos" ON storage.objects;

-- 3. Política para UPLOAD/INSERT - usuários autenticados podem fazer upload nas suas pastas
CREATE POLICY "Usuários podem fazer upload nas suas pastas" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'be-fest-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Política para SELECT/READ - acesso público para visualização
CREATE POLICY "Acesso público para visualização" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'be-fest-images');

-- 5. Política para DELETE - usuários podem deletar seus próprios arquivos
CREATE POLICY "Usuários podem deletar seus arquivos" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'be-fest-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Política para UPDATE - usuários podem atualizar seus próprios arquivos
CREATE POLICY "Usuários podem atualizar seus arquivos" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'be-fest-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'be-fest-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Habilitar RLS na tabela storage.objects (se não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se as políticas foram criadas corretamente
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
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname; 