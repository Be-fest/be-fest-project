'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdWarning, MdDelete } from 'react-icons/md';
import { deleteAccountAction } from '@/lib/actions/auth';
import { useToast } from '@/hooks/useToast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  userName = 'usuário'
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const CONFIRM_TEXT = 'EXCLUIR MINHA CONTA';
  const isConfirmValid = confirmText === CONFIRM_TEXT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfirmValid) {
      toast.error('Confirmação inválida', 'Digite exatamente o texto solicitado para confirmar.');
      return;
    }

    setLoading(true);

    try {
      const result = await deleteAccountAction();

      if (result.success) {
        // A action já redireciona para a home, então não precisamos fazer nada aqui
        toast.success('Conta excluída', 'Sua conta foi excluída com sucesso.');
      } else {
        toast.error('Erro ao excluir conta', result.error || 'Ocorreu um erro inesperado.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta', 'Ocorreu um erro inesperado.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <MdWarning className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Excluir Conta</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <MdClose className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <MdWarning className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">
                      Atenção: Esta ação é irreversível!
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Todos os seus dados serão permanentemente excluídos</li>
                      <li>• Suas festas e eventos serão removidos</li>
                      <li>• Não será possível recuperar sua conta</li>
                      <li>• Você será desconectado imediatamente</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="mb-6">
                <p className="text-gray-700">
                  Você está prestes a excluir permanentemente a conta de <strong>{userName}</strong>.
                </p>
              </div>

              {/* Confirmation Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Para confirmar, digite <strong>"{CONFIRM_TEXT}"</strong> no campo abaixo:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={CONFIRM_TEXT}
                    autoComplete="off"
                  />
                  {confirmText && !isConfirmValid && (
                    <p className="text-red-600 text-sm mt-1">
                      Texto não confere. Digite exatamente: {CONFIRM_TEXT}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isConfirmValid}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <MdDelete className="text-lg" />
                        Excluir Conta
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
