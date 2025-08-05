-- Trigger para preencher automaticamente o provider_state ao criar um serviço
-- Este trigger garante que o provider_state seja sempre preenchido com o estado do prestador

CREATE OR REPLACE FUNCTION auto_fill_provider_state()
RETURNS TRIGGER AS $$
BEGIN
    -- Se provider_state não foi fornecido ou está vazio, buscar o estado do prestador
    IF NEW.provider_state IS NULL OR NEW.provider_state = '' THEN
        SELECT state INTO NEW.provider_state
        FROM public.users
        WHERE id = NEW.provider_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger para INSERT na tabela services
DROP TRIGGER IF EXISTS trigger_auto_fill_provider_state ON public.services;
CREATE TRIGGER trigger_auto_fill_provider_state
    BEFORE INSERT ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION auto_fill_provider_state();

-- Comentário explicativo
COMMENT ON FUNCTION auto_fill_provider_state() IS 'Preenche automaticamente o campo provider_state com o estado do prestador ao criar um serviço';
COMMENT ON TRIGGER trigger_auto_fill_provider_state ON public.services IS 'Trigger que garante o preenchimento automático do provider_state na criação de serviços';