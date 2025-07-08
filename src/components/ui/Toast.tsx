'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const iconMap = {
  success: MdCheckCircle,
  error: MdError,
  warning: MdWarning,
  info: MdInfo,
};

const colorMap = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-800',
    message: 'text-green-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-800',
    message: 'text-red-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-800',
    message: 'text-blue-700',
  },
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        ${colors.bg} ${colors.border} 
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        max-w-md w-full pointer-events-auto
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${colors.title}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`mt-1 text-sm ${colors.message}`}>
              {toast.message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`
              inline-flex rounded-md p-1.5 transition-colors
              ${colors.icon} hover:bg-black/5
            `}
            onClick={() => onClose(toast.id)}
          >
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
} 