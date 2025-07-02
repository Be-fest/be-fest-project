"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button } from "@/components/ui";
import { forgotPasswordAction } from '@/lib/actions/auth';
import { MdClose, MdEmail } from "react-icons/md";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "client" | "service_provider";
}

// Wrapper function for useActionState compatibility
async function wrappedForgotPasswordAction(prevState: { success: boolean; error?: string; data?: any }, formData: FormData): Promise<{ success: boolean; error?: string; data?: any }> {
  return await forgotPasswordAction(formData);
}

export function ForgotPasswordModal({ isOpen, onClose, userType }: ForgotPasswordModalProps) {
  const [state, formAction, isPending] = useActionState(wrappedForgotPasswordAction, { success: false });
  const [email, setEmail] = useState('');

  const themeColor = userType === "service_provider" ? "#A502CA" : "#F71875";

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: themeColor }}>
                Esqueci a senha
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {!state.success ? (
              <>
                <p className="text-gray-600 mb-6">
                  Digite seu email para receber um link de recuperação de senha.
                </p>

                <form action={formAction} className="space-y-4">
                  {state.error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                      {state.error}
                    </div>
                  )}

                  <div className="relative">
                    <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isPending}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleClose}
                      className="flex-1"
                      style={{ 
                        backgroundColor: 'transparent',
                        color: themeColor,
                        border: `1px solid ${themeColor}`
                      }}
                      disabled={isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      style={{ backgroundColor: themeColor }}
                      disabled={isPending || !email.trim()}
                    >
                      {isPending ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 text-green-600 p-4 rounded-md mb-4">
                  <MdEmail className="text-3xl mx-auto mb-2" />
                  <p className="font-medium">{state.data?.message}</p>
                </div>
                <Button
                  onClick={handleClose}
                  className="w-full"
                  style={{ backgroundColor: themeColor }}
                >
                  Fechar
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 