-- Adicionar campo de endereço na tabela users
ALTER TABLE users 
ADD COLUMN address TEXT;

-- Comentário: Este campo armazenará o endereço completo do usuário
-- Formato esperado: "Rua/Avenida, Número, Complemento - Bairro - Cidade, Estado - CEP"
-- Exemplo: "Rua das Flores, 123, Apt 101 - Jardins - São Paulo, SP - 01234-567"