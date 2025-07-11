"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdCalendarToday, MdLocationOn, MdGroup, MdAccessTime, MdAttachMoney } from 'react-icons/md';
import { useCart } from '@/contexts/CartContext';
import { createEventAction } from '@/lib/actions/events';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { calculateGuestCount } from '@/utils/formatters';

interface PartyConfigFormProps {
  onComplete: () => void;
  initialData?: PartyFormData;
  pendingService?: {
    serviceId: string;
    serviceName: string;
    providerName: string;
    providerId: string;
    price: number;
    image: string;
  };
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
  budget: z.number().min(0, 'Orçamento não pode ser negativo').optional(),
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

export function PartyConfigForm({ onComplete, initialData, pendingService }: PartyConfigFormProps) {
  const { setPartyData, addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToastGlobal();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      location: '',
      full_guests: 0,
      half_guests: 0,
      free_guests: 0,
      budget: undefined,
    },
  });

  const onSubmit = async (data: PartyFormData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('event_date', data.event_date);
      if (data.start_time) formData.append('start_time', data.start_time);
      if (data.location) formData.append('location', data.location);
      formData.append('guest_count', calculateGuestCount(data.full_guests, data.half_guests, data.free_guests).toString());
      if (data.budget) formData.append('budget', data.budget.toString());

      const result = await createEventAction(formData);

      if (result.success && result.data) {
        // Toast de sucesso
        toast.success(
          'Festa criada com sucesso!',
          `A festa "${data.title}" foi criada e você será redirecionado para gerenciá-la.`,
          4000
        );

        // Save the party data for cart context (legacy compatibility)
        setPartyData({
          eventName: data.title,
          eventDate: data.event_date,
          startTime: data.start_time || '',
          location: data.location || '',
          fullGuests: data.full_guests,
          halfGuests: data.half_guests,
          freeGuests: data.free_guests,
        });

        // If there's a pending service, add it to the cart
        if (pendingService) {
          addToCart({
            name: pendingService.serviceName,
            serviceName: pendingService.serviceName,
            serviceId: pendingService.serviceId,
            price: pendingService.price,
            quantity: 1,
            providerId: pendingService.providerId,
            providerName: pendingService.providerName,
            category: 'service',
            image: pendingService.image
          });

          // Toast para serviço adicionado
          toast.info(
            'Serviço adicionado!',
            `${pendingService.serviceName} foi adicionado à sua festa.`,
            3000
          );
        }

        // Redirecionar para a página da festa criada após um delay
        setTimeout(() => {
          router.push(`/minhas-festas/${result.data!.id}`);
          onComplete();
        }, 1000);
      } else {
        const errorMessage = result.error || 'Erro ao criar evento';
        setError(errorMessage);
        toast.error(
          'Erro ao criar festa',
          errorMessage,
          5000
        );
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao criar evento';
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

      {/* Orçamento */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          <MdAttachMoney className="inline mr-1" />
          Orçamento Estimado
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register('budget', { 
            valueAsNumber: true,
            setValueAs: (value) => value === "" ? undefined : parseFloat(value)
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          placeholder="R$ 0,00 (opcional)"
          disabled={loading}
        />
        {errors.budget && (
          <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] text-white rounded-lg hover:from-[#8B0A9E] hover:to-[#520029] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando Festa...' : 'Criar Festa'}
        </button>
      </div>
    </form>
  );
}

