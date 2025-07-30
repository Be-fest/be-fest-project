// Utilitário para limpar localStorage
export const clearLocalStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Limpar dados específicos do BeFest
    localStorage.removeItem('be-fest-session');
    localStorage.removeItem('be-fest-user-data');
    
    // Limpar dados do Supabase (chaves que começam com 'sb-')
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('LocalStorage limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
  }
};

// Função para verificar se há dados corrompidos no localStorage
export const checkLocalStorageIntegrity = () => {
  if (typeof window === 'undefined') return true;
  
  try {
    const sessionData = localStorage.getItem('be-fest-session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      const now = Date.now();
      
      // Se a sessão expirou, limpar
      if (parsed.expiresAt && now > parsed.expiresAt) {
        clearLocalStorage();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Dados corrompidos no localStorage:', error);
    clearLocalStorage();
    return false;
  }
};

// Função para migrar dados de cookies para localStorage (se necessário)
export const migrateFromCookies = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // Verificar se já há dados no localStorage
    const hasLocalStorageData = localStorage.getItem('be-fest-session');
    
    if (!hasLocalStorageData) {
      // Se não há dados no localStorage, verificar se há cookies do Supabase
      const cookies = document.cookie.split(';');
      const supabaseCookies = cookies.filter(cookie => 
        cookie.trim().startsWith('sb-')
      );
      
      if (supabaseCookies.length > 0) {
        console.log('Migrando dados de cookies para localStorage...');
        // Aqui você pode implementar a migração se necessário
      }
    }
  } catch (error) {
    console.error('Erro ao migrar dados:', error);
  }
}; 