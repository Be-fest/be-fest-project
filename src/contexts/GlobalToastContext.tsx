'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import { SimpleToast } from '@/components/ui/SimpleToast';

interface GlobalToastContextType {
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const GlobalToastContext = createContext<GlobalToastContextType | undefined>(undefined);

export function GlobalToastProvider({ children }: { children: ReactNode }) {
  const { toast, showToast, hideToast, success, error, warning, info } = useSimpleToast();

  return (
    <GlobalToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      {toast && (
        <SimpleToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          show={showToast}
          onClose={hideToast}
        />
      )}
    </GlobalToastContext.Provider>
  );
}

export function useGlobalToast() {
  const context = useContext(GlobalToastContext);
  if (context === undefined) {
    throw new Error('useGlobalToast must be used within a GlobalToastProvider');
  }
  return context;
}

// Hook para usar em qualquer lugar sem contexto (fallback)
export function useToastGlobal() {
  try {
    return useGlobalToast();
  } catch {
    // Fallback se não estiver dentro do provider
    return {
      success: (title: string, message?: string) => console.log('Toast Success:', title, message),
      error: (title: string, message?: string) => console.error('Toast Error:', title, message),
      warning: (title: string, message?: string) => console.warn('Toast Warning:', title, message),
      info: (title: string, message?: string) => console.info('Toast Info:', title, message),
    };
  }
} 