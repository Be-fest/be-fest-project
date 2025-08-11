'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { SimpleToast } from '@/components/ui/SimpleToast';
import { AnimatePresence } from 'framer-motion';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface GlobalToastContextType {
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
  remove: (id: string) => void;
}

const GlobalToastContext = createContext<GlobalToastContextType | undefined>(undefined);

export function GlobalToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'success', title, message, duration }), [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'error', title, message, duration }), [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'warning', title, message, duration }), [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) =>
    addToast({ type: 'info', title, message, duration }), [addToast]);

  return (
    <GlobalToastContext.Provider value={{ success, error, warning, info, remove: removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50 space-y-2 md:space-y-3 max-h-screen overflow-hidden w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <SimpleToast
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              show={true}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
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
      success: (title: string, message?: string) => {
        console.log('Toast Success:', title, message);
        return 'fallback';
      },
      error: (title: string, message?: string) => {
        console.error('Toast Error:', title, message);
        return 'fallback';
      },
      warning: (title: string, message?: string) => {
        console.warn('Toast Warning:', title, message);
        return 'fallback';
      },
      info: (title: string, message?: string) => {
        console.info('Toast Info:', title, message);
        return 'fallback';
      },
      remove: (id: string) => console.log('Remove toast:', id),
    };
  }
}