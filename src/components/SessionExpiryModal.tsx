'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdWarning, MdRefresh, MdExitToApp, MdClose } from 'react-icons/md';

interface SessionExpiryModalProps {
  isOpen: boolean;
  minutesLeft: number | null;
  onExtendSession: () => Promise<boolean>;
  onLogout: () => void;
  onDismiss: () => void;
}

export function SessionExpiryModal({
  isOpen,
  minutesLeft,
  onExtendSession,
  onLogout,
  onDismiss
}: SessionExpiryModalProps) {
  const [isExtending, setIsExtending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtendSession = async () => {
    setIsExtending(true);
    setError(null);
    
    try {
      const success = await onExtendSession();
      if (success) {
        onDismiss();
      } else {
        setError('Não foi possível renovar a sessão. Você será desconectado.');
        setTimeout(() => {
          onLogout();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao estender sessão:', error);
      setError('Erro ao renovar sessão. Você será desconectado.');
      setTimeout(() => {
        onLogout();
      }, 2000);
    } finally {
      setIsExtending(false);
    }
  };

  const getWarningMessage = () => {
    if (!minutesLeft) return 'Sua sessão está prestes a expirar.';
    
    if (minutesLeft <= 1) {
      return 'Sua sessão expira em menos de 1 minuto.';
    } else {
      return `Sua sessão expira em ${minutesLeft} minuto${minutesLeft > 1 ? 's' : ''}.`;
    }
  };

  const getUrgencyColor = () => {
    if (!minutesLeft) return 'text-orange-600';
    if (minutesLeft <= 1) return 'text-red-600';
    if (minutesLeft <= 2) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getButtonColor = () => {
    if (!minutesLeft) return 'bg-orange-600 hover:bg-orange-700';
    if (minutesLeft <= 1) return 'bg-red-600 hover:bg-red-700';
    if (minutesLeft <= 2) return 'bg-orange-600 hover:bg-orange-700';
    return 'bg-yellow-600 hover:bg-yellow-700';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <MdWarning className="text-2xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Sessão Expirando</h2>
                      <p className="text-yellow-100">Ação necessária</p>
                    </div>
                  </div>
                  <button
                    onClick={onDismiss}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className={`text-lg font-semibold mb-2 ${getUrgencyColor()}`}>
                    {getWarningMessage()}
                  </div>
                  <p className="text-gray-600">
                    Para continuar usando o sistema, você precisa renovar sua sessão ou fazer login novamente.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleExtendSession}
                    disabled={isExtending}
                    className={`w-full px-4 py-3 ${getButtonColor()} text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isExtending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Renovando...
                      </>
                    ) : (
                      <>
                        <MdRefresh className="text-xl" />
                        Renovar Sessão
                      </>
                    )}
                  </button>

                  <button
                    onClick={onLogout}
                    disabled={isExtending}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <MdExitToApp className="text-xl" />
                    Fazer Logout
                  </button>

                  <button
                    onClick={onDismiss}
                    disabled={isExtending}
                    className="w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Continuar sem renovar
                  </button>
                </div>

                {/* Timer */}
                {minutesLeft !== null && minutesLeft > 0 && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-500">
                      Tempo restante: 
                      <span className={`font-mono font-bold ml-1 ${getUrgencyColor()}`}>
                        {minutesLeft}:{String(Math.floor((minutesLeft % 1) * 60)).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 