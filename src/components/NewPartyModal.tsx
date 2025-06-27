'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';
import { PartyConfigForm } from './PartyConfigForm';

interface NewPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewPartyModal({ isOpen, onClose, onSuccess }: NewPartyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold">Nova Festa</h2>
                    <p className="text-purple-100">Configure sua festa dos sonhos</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <MdClose className="text-2xl" />
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
        </>
      )}
    </AnimatePresence>
  );
}
