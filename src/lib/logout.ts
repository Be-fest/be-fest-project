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

    // 2. Limpar localStorage de forma mais agressiva
    console.log('🗑️ Limpando localStorage...');
    if (typeof window !== 'undefined') {
      // Limpar todos os itens relacionados ao Supabase e autenticação
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('sb-') || 
          key.includes('supabase') || 
          key === 'sessionExpired' ||
          key.includes('auth') ||
          key.includes('be-fest')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removido do localStorage: ${key}`);
      });
      
      // Limpar sessionStorage também
      sessionStorage.clear();
    }

    // 3. Limpar cookies de forma mais abrangente
    console.log('🍪 Limpando cookies...');
    if (typeof document !== 'undefined') {
      // Obter todos os cookies
      const cookies = document.cookie.split(';');
      
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Limpar cookies relacionados ao Supabase, autenticação e qualquer cookie de sessão
        if (name.includes('sb-') || name.includes('auth') || name.includes('supabase') || name.includes('session')) {
          // Limpar para o domínio atual
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          // Limpar para subdomínios
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          console.log(`🍪 Cookie removido: ${name}`);
        }
      });
    }

    // 4. Redirecionamento forçado com múltiplos métodos
    console.log('🔄 Redirecionando para login...');
    const redirectUrl = `/auth/login?reason=${encodeURIComponent(reason)}`;
    
    if (typeof window !== 'undefined') {
      console.log('🔄 Executando redirecionamento para:', redirectUrl);
      
      // Método 1: window.location.replace (imediato)
      try {
        window.location.replace(redirectUrl);
        return { success: true };
      } catch (error) {
        console.warn('Método 1 falhou, tentando método 2:', error);
      }
      
      // Método 2: window.location.href (com timeout)
      try {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
        return { success: true };
      } catch (error) {
        console.warn('Método 2 falhou, tentando método 3:', error);
      }
      
      // Método 3: Usar history API
      try {
        window.history.pushState(null, '', redirectUrl);
        window.location.reload();
        return { success: true };
      } catch (error) {
        console.warn('Método 3 falhou, tentando método 4:', error);
      }
      
      // Método 4: Último recurso - recarregar página
      try {
        window.location.reload();
        return { success: true };
      } catch (error) {
        console.error('Todos os métodos de redirecionamento falharam:', error);
        return { success: false, error };
      }
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erro durante logout:', error);
    
    // Mesmo com erro, tentar forçar redirecionamento
    if (typeof window !== 'undefined') {
      try {
        window.location.href = '/auth/login?reason=general_error';
      } catch (redirectError) {
        console.error('Erro no redirecionamento de emergência:', redirectError);
      }
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

/**
 * Função de logout de emergência - força redirecionamento imediatamente
 * Use apenas quando outros métodos falharem
 */
export function emergencyLogout(reason: string = 'emergency') {
  console.warn('🚨 Executando logout de emergência...');
  
  try {
    // Limpar localStorage rapidamente
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Limpar cookies básicos
    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
    
    // Forçar redirecionamento imediato
    const redirectUrl = `/auth/login?reason=${encodeURIComponent(reason)}`;
    window.location.replace(redirectUrl);
    
  } catch (error) {
    console.error('❌ Erro no logout de emergência:', error);
    // Último recurso: recarregar página
    window.location.reload();
  }
}

// Expor função no window para debug
if (typeof window !== 'undefined') {
  (window as any).emergencyLogout = emergencyLogout;
  console.log('🔧 Função de emergência disponível: window.emergencyLogout()');
} 