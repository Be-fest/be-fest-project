'use client';

import { useEffect, useState } from 'react';
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
    border: 'border-l-green-500',
    icon: 'text-green-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-green-500',
  },
  error: {
    bg: 'bg-white',
    border: 'border-l-red-500',
    icon: 'text-red-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-red-500',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-l-yellow-500',
    icon: 'text-yellow-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-yellow-500',
  },
  info: {
    bg: 'bg-white',
    border: 'border-l-blue-500',
    icon: 'text-blue-500',
    title: 'text-gray-900',
    message: 'text-gray-600',
    accent: 'bg-blue-500',
  },
};

export function SimpleToast({ 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  show 
}: SimpleToastProps) {
  const [isVisible, setIsVisible] = useState(show);
  const Icon = iconMap[type];
  const colors = colorMap[type];

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 200); // Delay para animação
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 200); // Delay para animação
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 400, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 400, scale: 0.8, transition: { duration: 0.2 } }}
          className={`
            ${colors.bg} ${colors.border} 
            border-l-4 border-r border-t border-b border-gray-200
            rounded-lg shadow-lg backdrop-blur-sm
            w-full pointer-events-auto
            relative overflow-hidden
          `}
        >
          {/* Accent bar animada */}
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            className={`absolute top-0 left-0 h-1 ${colors.accent}`}
          />
          
          <div className="flex items-start p-4">
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className={`text-sm font-semibold ${colors.title} leading-tight`}>
                {title}
              </p>
              {message && (
                <p className={`mt-1 text-sm ${colors.message} leading-relaxed`}>
                  {message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                className={`
                  inline-flex items-center justify-center w-6 h-6 rounded-full
                  text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  transition-colors duration-200
                `}
                onClick={handleClose}
              >
                <MdClose className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 