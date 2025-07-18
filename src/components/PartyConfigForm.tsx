"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdCalendarToday, MdLocationOn, MdGroup, MdAccessTime } from 'react-icons/md';
import { createEventAction, updateEventAction } from '@/lib/actions/events';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { calculateGuestCount } from '@/utils/formatters';

interface PartyConfigFormProps {
  onComplete: () => void;
  initialData?: PartyFormData;
  eventId?: string;
}

const partySchema = z.object({
  title: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().optional(),
  location: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres').optional(),
  full_guests: z.number().min(0, 'Número de convidados inteira deve ser 0 ou maior'),
  half_guests: z.number().min(0, 'Número de convidados meia deve ser 0 ou maior'),
  free_guests: z.number().min(0, 'Número de convidados gratuitos deve ser 0 ou maior'),
}).refine(data => {
  const eventDate = new Date(data.event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}, {
  message: 'Data deve ser futura',
  path: ['event_date'],
}).refine(data => {
  const totalGuests = data.full_guests + data.half_guests + data.free_guests;
  return totalGuests >= 1;
}, {
  message: 'Deve haver pelo menos 1 convidado no total',
  path: ['full_guests'],
});

type PartyFormData = z.infer<typeof partySchema>;

// Chave do localStorage para dados do formulário
const FORM_STORAGE_KEY = 'party-form-draft';

// Função para salvar dados no localStorage
const saveFormData = (data: Partial<PartyFormData>) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Erro ao salvar dados do formulário:', error);
  }
};

// Função para carregar dados do localStorage
const loadFormData = (): Partial<PartyFormData> | null => {
  try {
    const stored = localStorage.getItem(FORM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Erro ao carregar dados do formulário:', error);
    return null;
  }
};

// Função para limpar dados do localStorage
const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar dados do formulário:', error);
  }
};

export function PartyConfigForm({ onComplete, initialData, eventId }: PartyConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const toast = useToastGlobal();
  
  // Carregar dados salvos do localStorage se não houver initialData e não for edição
  const getDefaultValues = (): PartyFormData => {
    const defaultValues: PartyFormData = {
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      location: '',
      full_guests: 0,
      half_guests: 0,
      free_guests: 0,
    };

    // Se for edição, use initialData
    if (eventId && initialData) {
      return { ...defaultValues, ...initialData };
    }

    // Se não for edição, tente carregar do localStorage
    if (!eventId) {
      const savedData = loadFormData();
      if (savedData) {
        return { ...defaultValues, ...savedData };
      }
    }

    return initialData || defaultValues;
  };
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: getDefaultValues(),
  });

  // Observar mudanças no formulário para auto-salvar
  const watchedValues = watch();

  // Effect para auto-salvar dados no localStorage (apenas para criação)
  useEffect(() => {
    if (!eventId && !loading) {
      // Verificar se há mudanças nos dados
      const defaultValues = {
        title: '',
        description: '',
        event_date: '',
        start_time: '',
        location: '',
        full_guests: 0,
        half_guests: 0,
        free_guests: 0,
      };

      const hasChanges = Object.keys(watchedValues).some(key => {
        const currentValue = watchedValues[key as keyof PartyFormData];
        const defaultValue = defaultValues[key as keyof PartyFormData];
        return currentValue !== defaultValue && currentValue !== '' && currentValue !== 0;
      });

      setHasUnsavedChanges(hasChanges);

      // Auto-salvar apenas se houver mudanças
      if (hasChanges) {
        const timeoutId = setTimeout(() => {
          saveFormData(watchedValues);
        }, 1000); // Auto-salvar após 1 segundo de inatividade

        return () => clearTimeout(timeoutId);
      }
    }
  }, [watchedValues, eventId, loading]);

  // Função para limpar dados salvos ao completar com sucesso
  const handleFormSuccess = () => {
    if (!eventId) {
      clearFormData();
    }
    setHasUnsavedChanges(false);
    onComplete();
  };

  // Função para limpar dados salvos manualmente
  const handleClearSavedData = () => {
    clearFormData();
    reset({
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      location: '',
      full_guests: 0,
      half_guests: 0,
      free_guests: 0,
    });
    setHasUnsavedChanges(false);
    toast.success('Dados salvos foram limpos');
  };

  // Mostrar notificação se dados foram recuperados
  useEffect(() => {
    if (!eventId && !initialData) {
      const savedData = loadFormData();
      if (savedData && Object.keys(savedData).length > 0) {
        const hasValidData = Object.values(savedData).some(value => 
          value !== '' && value !== 0 && value !== null && value !== undefined
        );
        
        if (hasValidData) {
          toast.success('Dados anteriores foram recuperados', 'Seus dados salvos foram restaurados automaticamente');
        }
      }
    }
  }, [eventId, initialData, toast]);

  const onSubmit = async (data: PartyFormData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Se for edição, incluir o ID
      if (eventId) {
        formData.append('id', eventId);
      }
      
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('event_date', data.event_date);
      if (data.start_time) formData.append('start_time', data.start_time);
      if (data.location) formData.append('location', data.location);
      formData.append('guest_count', calculateGuestCount(data.full_guests, data.half_guests, data.free_guests).toString());
      formData.append('full_guests', data.full_guests.toString());
      formData.append('half_guests', data.half_guests.toString());
      formData.append('free_guests', data.free_guests.toString());

      // Usar action apropriada baseado no modo
      const result = eventId 
        ? await updateEventAction(formData)
        : await createEventAction(formData);

      if (result.success && result.data) {
        // Toast de sucesso
        const isEditing = !!eventId;
        toast.success(
          isEditing 
            ? `A festa "${data.title}" foi atualizada.`
            : `A festa "${data.title}" foi criada e você será redirecionado para gerenciá-la.`,
          undefined, // message (optional)
          4000 // duration
        );

        // Redirecionar ou simplesmente completar
        if (eventId) {
          // Para edição, só chamar handleFormSuccess
          handleFormSuccess();
        } else {
          // Para criação, redirecionar após delay
          setTimeout(() => {
            router.push(`/minhas-festas/${result.data!.id}`);
            handleFormSuccess();
          }, 1000);
        }
      } else {
        const errorMessage = result.error || (eventId ? 'Erro ao atualizar evento' : 'Erro ao criar evento');
        setError(errorMessage);
        toast.error(
          eventId ? 'Erro ao atualizar festa' : 'Erro ao criar festa',
          errorMessage,
          5000
        );
      }
    } catch (error) {
      const errorMessage = eventId ? 'Erro inesperado ao atualizar evento' : 'Erro inesperado ao criar evento';
      setError(errorMessage);
      toast.error(
        'Erro inesperado',
        errorMessage,
        5000
      );
    } finally {
      setLoading(false);
    }
  };

  const fullGuests = watch('full_guests');
  const halfGuests = watch('half_guests');
  const freeGuests = watch('free_guests');
  const totalGuests = calculateGuestCount(fullGuests, halfGuests, freeGuests);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Indicador de auto-salvamento para criação */}
      {!eventId && hasUnsavedChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-sm flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Dados salvos automaticamente
          </p>
        </div>
      )}

      {/* Botão para limpar dados salvos (apenas para criação) */}
      {!eventId && hasUnsavedChanges && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleClearSavedData}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Limpar dados salvos
          </button>
        </div>
      )}

      {/* Nome do Evento */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Nome do Evento *
        </label>
        <input
          type="text"
          {...register('title')}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          placeholder="Ex: Aniversário da Maria"
          disabled={loading}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Descrição
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          placeholder="Descreva sua festa (opcional)"
          disabled={loading}
        />
      </div>

      {/* Data e Horário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#520029] mb-2">
            <MdCalendarToday className="inline mr-1" />
            Data do Evento *
          </label>
          <input
            type="date"
            {...register('event_date')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
            disabled={loading}
          />
          {errors.event_date && (
            <p className="text-red-500 text-sm mt-1">{errors.event_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#520029] mb-2">
            <MdAccessTime className="inline mr-1" />
            Horário de Início
          </label>
          <input
            type="time"
            {...register('start_time')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
            disabled={loading}
          />
          {errors.start_time && (
            <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
          )}
        </div>
      </div>

      {/* Local */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          <MdLocationOn className="inline mr-1" />
          Local do Evento
        </label>
        <input
          type="text"
          {...register('location')}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          placeholder="Ex: Rua das Flores, 123 - Jardins, São Paulo"
          disabled={loading}
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      {/* Número de Convidados por Categoria */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-3">
          <MdGroup className="inline mr-1" />
          Número de Convidados *
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inteira */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-green-600">
              Inteira (13+ anos)
            </label>
            <input
              type="number"
              min="0"
              {...register('full_guests', { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? 0 : parseInt(value, 10)
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
              placeholder="0"
              disabled={loading}
            />
            {errors.full_guests && (
              <p className="text-red-500 text-xs mt-1">{errors.full_guests.message}</p>
            )}
          </div>

          {/* Meia */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-blue-600">
              Meia (6-12 anos)
            </label>
            <input
              type="number"
              min="0"
              {...register('half_guests', { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? 0 : parseInt(value, 10)
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
              placeholder="0"
              disabled={loading}
            />
            {errors.half_guests && (
              <p className="text-red-500 text-xs mt-1">{errors.half_guests.message}</p>
            )}
          </div>

          {/* Free */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-orange-600">
              Gratuito (0-5 anos)
            </label>
            <input
              type="number"
              min="0"
              {...register('free_guests', { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? 0 : parseInt(value, 10)
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
              placeholder="0"
              disabled={loading}
            />
            {errors.free_guests && (
              <p className="text-red-500 text-xs mt-1">{errors.free_guests.message}</p>
            )}
          </div>
        </div>
        
        {totalGuests > 0 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Total de convidados: {totalGuests}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fullGuests > 0 && `${fullGuests} inteira`}
              {halfGuests > 0 && `${fullGuests > 0 ? ', ' : ''}${halfGuests} meia`}
              {freeGuests > 0 && `${(fullGuests > 0 || halfGuests > 0) ? ', ' : ''}${freeGuests} gratuito`}
            </p>
          </div>
        )}
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] hover:from-[#8B0A9E] hover:to-[#6B0A7E] disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {eventId ? 'Atualizando...' : 'Criando...'}
            </div>
          ) : (
            eventId ? 'Atualizar Festa' : 'Criar Festa'
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </form>
  );
}

