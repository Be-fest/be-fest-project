// Configurações específicas para produção
export const PRODUCTION_CONFIG = {
  // Timeouts mais agressivos para evitar loading infinito
  AUTH_TIMEOUT: 8000, // 8 segundos máximo para autenticação
  SESSION_CHECK_TIMEOUT: 5000, // 5 segundos para verificação de sessão
  USER_DATA_TIMEOUT: 6000, // 6 segundos para buscar dados do usuário
  
  // Retry configuration
  MAX_RETRIES: 2, // Reduzido para produção
  RETRY_DELAY_BASE: 1000, // 1 segundo base
  
  // Cache configuration
  SESSION_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas
  USER_DATA_CACHE_DURATION: 60 * 60 * 1000, // 1 hora
  
  // Performance optimizations
  ENABLE_BACKGROUND_REFRESH: true,
  ENABLE_AGGRESSIVE_TIMEOUT: true,
  ENABLE_FALLBACK_LOADING: true,
  
  // Error handling
  SILENT_BACKGROUND_ERRORS: true,
  ENABLE_ERROR_RECOVERY: true,
  
  // SSR/Hydration
  ENABLE_SSR_FALLBACK: true,
  HYDRATION_TIMEOUT: 3000, // 3 segundos para hidratação
};

// Função para verificar se estamos em produção
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Tipos para operações de timeout
type TimeoutOperation = 'AUTH_TIMEOUT' | 'SESSION_CHECK_TIMEOUT' | 'USER_DATA_TIMEOUT' | 'HYDRATION_TIMEOUT';

// Função para obter timeout baseado no ambiente
export const getTimeout = (operation: TimeoutOperation): number => {
  if (isProduction()) {
    return PRODUCTION_CONFIG[operation] as number;
  }
  
  // Timeouts mais longos em desenvolvimento
  const devTimeouts: Record<TimeoutOperation, number> = {
    AUTH_TIMEOUT: 15000,
    SESSION_CHECK_TIMEOUT: 10000,
    USER_DATA_TIMEOUT: 12000,
    HYDRATION_TIMEOUT: 5000,
  };
  
  return devTimeouts[operation] || (PRODUCTION_CONFIG[operation] as number);
};

// Função para verificar se deve usar fallback
export const shouldUseFallback = () => {
  return isProduction() && PRODUCTION_CONFIG.ENABLE_FALLBACK_LOADING;
};

// Função para verificar se deve silenciar erros
export const shouldSilenceErrors = () => {
  return isProduction() && PRODUCTION_CONFIG.SILENT_BACKGROUND_ERRORS;
};