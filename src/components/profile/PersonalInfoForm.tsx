'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { updateUserProfileAction } from '@/lib/actions/users';

interface PersonalInfoFormProps {
  onClose: () => void;
}

export function PersonalInfoForm({ onClose }: PersonalInfoFormProps) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || '',
    email: userData?.email || '',
    whatsapp_number: userData?.whatsapp_number || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUserProfileAction({
        full_name: formData.full_name,
        email: formData.email,
        whatsapp_number: formData.whatsapp_number
      });
      
      if (result.success) {
        toast.success('Perfil atualizado', 'Suas informações foram atualizadas com sucesso!');
        onClose();
      } else {
        toast.error('Erro ao atualizar', result.error || 'Ocorreu um erro ao atualizar suas informações.');
      }
    } catch (error) {
      toast.error('Erro ao atualizar', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Nome completo"
          value={formData.full_name}
          onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        
        <Input
          label="WhatsApp"
          value={formData.whatsapp_number}
          onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_number: e.target.value }))}
          required
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#F71875] hover:bg-[#E6006F] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
} 