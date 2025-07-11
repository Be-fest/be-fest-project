import { createClient } from '@/lib/supabase/client';

/**
 * Função utilitária para fazer logout de forma consistente em toda a aplicação
 */
export async function performLogout(reason: string = 'logout') {
  try {
    console.log('🔄 Iniciando processo de logout...');
    
    const supabase = createClient();
    
    // 1. Fazer logout no Supabase
    console.log('🔐 Fazendo logout no Supabase...');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Erro ao fazer logout no Supabase:', error);
    } else {
      console.log('✅ Logout do Supabase realizado com sucesso');
    }

    // 2. Limpar localStorage
    console.log('🗑️ Limpando localStorage...');
    if (typeof window !== 'undefined') {
      // Limpar itens específicos do Supabase
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key === 'sessionExpired')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removido do localStorage: ${key}`);
      });
    }

    // 3. Limpar cookies
    console.log('🍪 Limpando cookies...');
    if (typeof document !== 'undefined') {
      // Obter todos os cookies
      const cookies = document.cookie.split(';');
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Limpar cookies relacionados ao Supabase e autenticação
        if (name.includes('sb-') || name.includes('auth') || name.includes('supabase')) {
          // Limpar para o domínio atual
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          // Limpar para subdomínios
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          console.log(`🍪 Cookie removido: ${name}`);
        }
      });
    }

    // 4. Redirecionamento
    console.log('🔄 Redirecionando para login...');
    const redirectUrl = `/auth/login?reason=${encodeURIComponent(reason)}`;
    
    // Usar window.location.href para forçar refresh completo
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erro durante logout:', error);
    
    // Mesmo com erro, tentar forçar redirecionamento
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?reason=general_error';
    }
    
    return { success: false, error };
  }
}

/**
 * Função para logout com toast de feedback (se disponível)
 */
export async function performLogoutWithFeedback(
  showToast?: (type: 'success' | 'error', title: string, message: string) => void,
  reason: string = 'logout'
) {
  try {
    if (showToast) {
      showToast('success', 'Fazendo logout...', 'Encerrando sua sessão...');
    }
    
    const result = await performLogout(reason);
    
    if (result.success && showToast) {
      showToast('success', 'Logout realizado', 'Você foi desconectado com sucesso!');
    }
    
    return result;
  } catch (error) {
    if (showToast) {
      showToast('error', 'Erro no logout', 'Houve um problema ao encerrar sua sessão.');
    }
    
    // Mesmo assim, tentar logout forçado
    return performLogout(reason);
  }
} 