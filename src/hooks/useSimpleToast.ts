'use client';

import { useState, useCallback } from 'react';

interface ToastData {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export function useSimpleToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [showToast, setShowToast] = useState(false);

  const showToastMessage = useCallback((data: ToastData) => {
    setToast(data);
    setShowToast(true);
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
    setTimeout(() => setToast(null), 200);
  }, []);

  const toastMethods = {
    success: (title: string, message?: string, duration?: number) =>
      showToastMessage({ type: 'success', title, message, duration }),
    error: (title: string, message?: string, duration?: number) =>
      showToastMessage({ type: 'error', title, message, duration }),
    warning: (title: string, message?: string, duration?: number) =>
      showToastMessage({ type: 'warning', title, message, duration }),
    info: (title: string, message?: string, duration?: number) =>
      showToastMessage({ type: 'info', title, message, duration }),
  };

  return {
    toast,
    showToast,
    hideToast,
    ...toastMethods,
  };
} 