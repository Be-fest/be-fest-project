"use client";

import { useState, useActionState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button } from "@/components/ui";
import { forgotPasswordAction } from '@/lib/actions/auth';
import { MdClose, MdEmail, MdCheckCircle } from "react-icons/md";
import { useToastGlobal } from '@/contexts/GlobalToastContext';

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
  const [email, setEmail] = useState('');
  const [state, formAction, isPending] = useActionState(wrappedForgotPasswordAction, { success: false });
  const toast = useToastGlobal();

  const themeColor = userType === "service_provider" ? "#A502CA" : "#F71875";

  const handleClose = () => {
    setEmail('');
    onClose();
  };

  // Mostrar toasts baseados no estado
  useEffect(() => {
    if (state.success && state.data?.message) {
      toast.success(
        'Email enviado com sucesso!',
        state.data.message,
        6000
      );
    }
  }, [state.success, state.data, toast]);

  useEffect(() => {
    if (!state.success && state.error) {
      toast.error(
        'Erro ao enviar email',
        state.error,
        5000
      );
    }
  }, [state.error, state.success, toast]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: themeColor }}>
                Recuperar Senha
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {!state.success ? (
              <>
                <p className="text-gray-600 mb-6">
                  Digite seu email para receber um link de recuperação de senha.
                </p>

                <form action={formAction} className="space-y-4">
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <MdCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Email enviado!
                </h3>
                <p className="text-gray-600 mb-6">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <Button
                  onClick={handleClose}
                  className="w-full"
                  style={{ backgroundColor: themeColor }}
                >
                  Fechar
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 