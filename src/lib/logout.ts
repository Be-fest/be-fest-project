import { createClient } from '@/lib/supabase/client';

/**
 * Função utilitária para fazer logout de forma consistente em toda a aplicação
 */
export async function performLogout(reason: string = 'logout') {
  try {
    console.log('🔄 Iniciando processo de logout...');
    
    // 1. Limpar dados locais primeiro (mais rápido)
    console.log('🗑️ Limpando dados locais...');
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // 2. Fazer logout no Supabase de forma assíncrona (não bloquear)
    console.log('🔐 Fazendo logout no Supabase...');
    const supabase = createClient();
    
    // Usar Promise.race para não esperar mais que 2 segundos
    const logoutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    
    try {
      await Promise.race([logoutPromise, timeoutPromise]);
      console.log('✅ Logout do Supabase realizado com sucesso');
    } catch (error) {
      console.warn('⚠️ Logout do Supabase demorou muito ou falhou (continuando):', error);
    }

    // 3. Redirecionamento imediato
    console.log('🔄 Redirecionando para login...');
    const redirectUrl = `/auth/login?reason=${encodeURIComponent(reason)}`;
    
    if (typeof window !== 'undefined') {
      console.log('🔄 Executando redirecionamento para:', redirectUrl);
      window.location.replace(redirectUrl);
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