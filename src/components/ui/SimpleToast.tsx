'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCheckCircle, MdError, MdWarning, MdInfo } from 'react-icons/md';

interface SimpleToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  show: boolean;
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

// Hook personalizado para gerenciar timers de forma mais eficiente
function useToastTimer(
  isVisible: boolean,
  duration: number,
  onClose: (() => void) | undefined,
  onProgressUpdate: (updater: (prev: number) => number) => void
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCloseRef = useRef(onClose);

  // Manter a referência atualizada do callback
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const startTimer = useCallback(() => {
    if (!isVisible || duration <= 0) return;

    // Limpar timers existentes
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Iniciar animação da barra de progresso
    intervalRef.current = setInterval(() => {
      onProgressUpdate((prev: number) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    // Timer para fechar o toast
    timeoutRef.current = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);
  }, [isVisible, duration, onProgressUpdate]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return clearTimers;
  }, [startTimer, clearTimers]);

  return clearTimers;
}

export function SimpleToast({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  show 
}: SimpleToastProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [progress, setProgress] = useState(100);
  const Icon = iconMap[type];
  const colors = colorMap[type];

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      setProgress(100);
    }
  }, [show]);

  const clearTimers = useToastTimer(
    isVisible,
    duration,
    () => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 200);
    },
    setProgress
  );

  const handleClose = useCallback(() => {
    clearTimers();
    setIsVisible(false);
    setTimeout(() => onClose?.(), 200);
  }, [clearTimers, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="pointer-events-auto"
      style={{ width: '600px', minWidth: '600px' }}
    >
      <div className={`
        ${colors.bg} 
        border-l-4 ${colors.border}
        border-r border-t border-b border-gray-200
        rounded-lg shadow-xl ${colors.shadow}
        relative overflow-hidden
        backdrop-blur-sm
      `}>
        {/* Barra de progresso no topo */}
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full">
          <div 
            className={`h-full ${colors.accent} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Conteúdo do toast */}
        <div className="flex items-start p-5 pt-6">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          
          <div className="ml-4 flex-1">
            <p className={`text-base font-semibold ${colors.title} leading-tight`}>
              {title}
            </p>
            {message && (
              <p className={`mt-2 text-sm ${colors.message} leading-relaxed`}>
                {message}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              onClick={handleClose}
            >
              <MdClose className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 