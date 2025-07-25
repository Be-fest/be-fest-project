'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui';
import { useToast } from '@/hooks/useToast';
import { updateUserAddressAction } from '@/lib/actions/users';

interface AddressFormProps {
  onClose: () => void;
}

export function AddressForm({ onClose }: AddressFormProps) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: userData?.address || '',
    city: userData?.city || '',
    state: userData?.state || '',
    postal_code: userData?.postal_code || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUserAddressAction({
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code
      });
      
      if (result.success) {
        toast.success('Endereço atualizado', 'Seu endereço foi atualizado com sucesso!');
        onClose();
      } else {
        toast.error('Erro ao atualizar', result.error || 'Ocorreu um erro ao atualizar seu endereço.');
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
          label="Endereço"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cidade"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            required
          />
          
          <Input
            label="Estado"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            required
          />
        </div>
        
        <Input
          label="CEP"
          value={formData.postal_code}
          onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
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