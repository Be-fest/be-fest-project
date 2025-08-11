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
    bg: 'bg-white',
    border: 'border-green-500',
    icon: 'text-green-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-green-500',
    shadow: 'shadow-green-100',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-500',
    icon: 'text-red-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-red-500',
    shadow: 'shadow-red-100',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-yellow-500',
    icon: 'text-yellow-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-yellow-500',
    shadow: 'shadow-yellow-100',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-500',
    icon: 'text-blue-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-blue-500',
    shadow: 'shadow-blue-100',
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
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-auto w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
    >
      <div className={`
        ${colors.bg} 
        border-l-4 ${colors.border}
        border-r border-t border-b border-gray-200
        rounded-lg shadow-xl ${colors.shadow}
        relative overflow-hidden
        backdrop-blur-sm
      `}>
        <div className="flex items-start p-3 md:p-4 lg:p-5">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 md:h-6 md:w-6 ${colors.icon}`} />
          </div>
          <div className="ml-3 md:ml-4 flex-1 min-w-0">
            <p className={`text-sm md:text-base font-semibold ${colors.title} leading-tight`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={`mt-1 md:mt-2 text-xs md:text-sm ${colors.message} leading-relaxed`}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-3 md:ml-4 flex-shrink-0">
            <button
              className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => onClose(toast.id)}
            >
              <MdClose className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
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
    <div className="fixed top-2 right-2 md:top-4 md:right-4 z-[9999] flex flex-col gap-2 md:gap-3 pointer-events-none w-full max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}