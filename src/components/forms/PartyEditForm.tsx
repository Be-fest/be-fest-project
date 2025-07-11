import React from 'react';
import { Input } from '../ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdClose } from 'react-icons/md';

const partySchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  horario: z.string().min(1, 'Horário é obrigatório'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  convidados: z.number().min(1, 'Número de convidados deve ser maior que 0'),
  observacoes: z.string().optional(),
});

type PartyFormData = z.infer<typeof partySchema>;

interface PartyEditFormProps {
  initialData: {
    nome: string;
    data: string;
    horario: string;
    endereco: string;
    convidados: number;
    observacoes?: string;
  };
  onSubmit: (data: PartyFormData) => void;
  onClose: () => void;
}

export function PartyEditForm({ initialData, onSubmit, onClose }: PartyEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      ...initialData,
      data: initialData.data.split('T')[0], // Ensure date is in YYYY-MM-DD format
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#520029]">Editar Festa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome da Festa"
            placeholder="Ex: Aniversário da Ana"
            error={errors.nome?.message}
            {...register('nome')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              error={errors.data?.message}
              {...register('data')}
            />

            <Input
              label="Horário"
              type="time"
              error={errors.horario?.message}
              {...register('horario')}
            />
          </div>

          <Input
            label="Endereço"
            placeholder="Ex: Rua das Flores, 123"
            error={errors.endereco?.message}
            {...register('endereco')}
          />

          <Input
            label="Número de Convidados"
            type="number"
            placeholder="Ex: 50"
            error={errors.convidados?.message}
            {...register('convidados', { valueAsNumber: true })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 transition-all"
              rows={4}
              placeholder="Observações adicionais sobre a festa..."
              {...register('observacoes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 