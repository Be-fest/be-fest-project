'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { PartyConfigForm } from './PartyConfigForm';

interface NewPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Função para verificar se há dados salvos
const hasSavedFormData = (): boolean => {
  try {
    const saved = localStorage.getItem('party-form-draft');
    if (!saved) return false;
    
    const data = JSON.parse(saved);
    return Object.values(data).some(value => 
      value !== '' && value !== 0 && value !== null && value !== undefined
    );
  } catch {
    return false;
  }
};

export function NewPartyModal({ isOpen, onClose, onSuccess }: NewPartyModalProps) {
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const handleCloseClick = () => {
    // Verificar se há dados salvos antes de fechar
    if (hasSavedFormData()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
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
            onClick={handleCloseClick}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xs md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] p-4 md:p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Nova Festa</h2>
                    <p className="text-purple-100 text-sm md:text-base">Configure sua festa dos sonhos</p>
                  </div>
                  <button
                    onClick={handleCloseClick}
                    className="p-1 md:p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <MdClose className="text-xl md:text-2xl" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <PartyConfigForm
                onComplete={() => {
                  onSuccess?.();
                  onClose();
                }}
              />
            </motion.div>
          </motion.div>

          {/* Modal de confirmação */}
          <AnimatePresence>
            {showConfirmClose && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60"
                onClick={handleCancelClose}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Fechar sem salvar?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Você tem dados salvos que serão preservados. Tem certeza que deseja fechar o formulário?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleCancelClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmClose}
                      className="px-4 py-2 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
