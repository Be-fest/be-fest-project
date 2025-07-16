-- Políticas de Storage para o bucket 'be-fest-images'
-- Execute este script no SQL Editor do Supabase

-- 1. Permitir que usuários autenticados façam upload de imagens em suas próprias pastas
CREATE POLICY "Users can upload images to their own folder" ON storage.objects
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'be-fest-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Permitir que usuários autenticados vejam suas próprias imagens
CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'be-fest-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Permitir que qualquer pessoa veja imagens (para exibição pública dos serviços)
CREATE POLICY "Anyone can view service images" ON storage.objects
FOR SELECT 
TO public 
USING (bucket_id = 'be-fest-images');

-- 4. Permitir que usuários deletem suas próprias imagens
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'be-fest-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Permitir que usuários atualizem suas próprias imagens
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'be-fest-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verificar se o bucket existe e tem RLS habilitado
-- Se não existir, você precisa criar pelo painel do Supabase Storage
-- O RLS deve estar habilitado para que as políticas funcionem 