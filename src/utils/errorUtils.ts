// Utilitários para tratamento de erros

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  timestamp: string;
  userId?: string;
}

// Função para verificar se o erro é de JWT expirado
export const isJWTExpiredError = (error: any): boolean => {
  return (
    error?.code === 'PGRST301' ||
    error?.message?.includes('JWT expired') ||
    error?.message?.includes('jwt expired') ||
    error?.message?.includes('token expired') ||
    error?.message?.includes('invalid token')
  );
};

// Função para verificar se o erro é de rede/timeout
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('timeout') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('ERR_NETWORK')
  );
};

// Função para verificar se o erro é de permissão/RLS
export const isPermissionError = (error: any): boolean => {
  return (
    error?.code === 'PGRST116' ||
    error?.message?.includes('permission denied') ||
    error?.message?.includes('row security') ||
    error?.message?.includes('insufficient privileges')
  );
};

// Função para verificar se o erro é de registro não encontrado
export const isNotFoundError = (error: any): boolean => {
  return (
    error?.code === 'PGRST116' ||
    error?.message?.includes('No rows found') ||
    error?.message?.includes('not found') ||
    error?.message?.includes('does not exist')
  );
};

// Função para criar objeto de erro padronizado
export const createErrorInfo = (error: any, context?: string): ErrorInfo => {
  return {
    message: error?.message || 'Erro desconhecido',
    code: error?.code || 'Sem código de erro',
    details: error?.details || 'Sem detalhes',
    hint: error?.hint || 'Sem dica',
    timestamp: new Date().toISOString(),
    ...(context && { context })
  };
};

// Função para obter mensagem de erro amigável
export const getFriendlyErrorMessage = (error: any): string => {
  if (isJWTExpiredError(error)) {
    return 'Sua sessão expirou. Faça login novamente para continuar.';
  }
  
  if (isNetworkError(error)) {
    return 'Problema de conexão detectado. Verifique sua internet e tente novamente.';
  }
  
  if (isPermissionError(error)) {
    return 'Você não tem permissão para acessar estes dados. Tente fazer login novamente.';
  }
  
  if (isNotFoundError(error)) {
    return 'Dados não encontrados. Tente recarregar a página.';
  }
  
  if (error?.message?.includes('timeout')) {
    return 'A requisição demorou muito para responder. Tente novamente.';
  }
  
  return error?.message || 'Ocorreu um erro inesperado. Tente novamente.';
};

// Função para obter ícone baseado no tipo de erro
export const getErrorIcon = (error: any): string => {
  if (isJWTExpiredError(error)) {
    return '🔑';
  }
  
  if (isNetworkError(error)) {
    return '🌐';
  }
  
  if (isPermissionError(error)) {
    return '🔒';
  }
  
  if (isNotFoundError(error)) {
    return '🔍';
  }
  
  if (error?.message?.includes('timeout')) {
    return '⏰';
  }
  
  return '⚠️';
};

// Função para determinar se deve tentar novamente
export const shouldRetry = (error: any, retryCount: number, maxRetries: number = 3): boolean => {
  if (retryCount >= maxRetries) {
    return false;
  }
  
  // Não tentar novamente para erros de JWT expirado
  if (isJWTExpiredError(error)) {
    return false;
  }
  
  // Tentar novamente para erros de rede
  if (isNetworkError(error)) {
    return true;
  }
  
  // Tentar novamente para timeouts
  if (error?.message?.includes('timeout')) {
    return true;
  }
  
  // Tentar novamente para erros de registro não encontrado (pode ser temporário)
  if (isNotFoundError(error)) {
    return true;
  }
  
  return false;
};

// Função para calcular delay de retry exponencial
export const getRetryDelay = (retryCount: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000); // Máximo 10 segundos
};

// Função para logar erro de forma segura
export const safeLogError = (message: string, error: any, context?: string) => {
  try {
    const errorInfo = createErrorInfo(error, context);
    console.error(message, errorInfo);
  } catch (logError) {
    console.error(message, 'Erro ao processar dados de erro:', logError);
  }
}; 