'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdSave, MdPerson } from 'react-icons/md';
import { updateUserProfileAction } from '@/lib/actions/auth';
import { useToast } from '@/hooks/useToast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    full_name?: string | null;
    whatsapp_number?: string | null;
    organization_name?: string | null;
    email?: string | null;
  };
  onSuccess?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    fullName: userData?.full_name || '',
    whatsappNumber: userData?.whatsapp_number || '',
    organizationName: userData?.organization_name || ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Atualizar formData quando userData mudar ou modal abrir
  React.useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        fullName: userData?.full_name || '',
        whatsappNumber: userData?.whatsapp_number || '',
        organizationName: userData?.organization_name || ''
      });
    }
  }, [isOpen, userData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('fullName', formData.fullName);
      formDataObj.append('whatsappNumber', formData.whatsappNumber);
      if (formData.organizationName) {
        formDataObj.append('organizationName', formData.organizationName);
      }

      const result = await updateUserProfileAction(formDataObj);

      if (result.success) {
        toast.success('Perfil atualizado!', 'Suas informações foram atualizadas com sucesso.');
        onSuccess?.();
        onClose();
      } else {
        toast.error('Erro ao atualizar perfil', result.error || 'Ocorreu um erro inesperado.');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aplicar máscara para o telefone
    if (name === 'whatsappNumber') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Função para formatar número de telefone
  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é número
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
        .replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3')
        .replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
        .replace(/^(\d{0,2})$/, '($1');
    }
    return value;
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fullName: userData?.full_name || '',
        whatsappNumber: userData?.whatsapp_number || '',
        organizationName: userData?.organization_name || ''
      });
      onClose();
    }
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
                <div className="w-10 h-10 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-xl flex items-center justify-center">
                  <MdPerson className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Informações Pessoais</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <MdClose className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Nome da Organização (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Organização
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Nome da sua empresa (opcional)"
                />
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
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#9400B8] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <MdSave className="text-lg" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
