"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdCalendarToday, MdLocationOn, MdGroup, MdAccessTime } from 'react-icons/md';
import { useCart } from '@/contexts/CartContext';

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
  eventName: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  eventDate: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário é obrigatório'),
  location: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  fullGuests: z.number().min(0, 'Número de convidados não pode ser negativo'),
  halfGuests: z.number().min(0, 'Número de convidados não pode ser negativo'),
  freeGuests: z.number().min(0, 'Número de convidados não pode ser negativo'),
}).refine(data => {
  const totalGuests = data.fullGuests + data.halfGuests + data.freeGuests;
  return totalGuests > 0;
}, {
  message: 'Deve haver pelo menos 1 convidado',
  path: ['fullGuests'],
}).refine(data => {
  const eventDate = new Date(data.eventDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate >= today;
}, {
  message: 'Data deve ser futura',
  path: ['eventDate'],
});

type PartyFormData = z.infer<typeof partySchema>;

export function PartyConfigForm({ onComplete, initialData, pendingService }: PartyConfigFormProps) {
  const { setPartyData, addToCart } = useCart();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: initialData || {
      eventName: '',
      eventDate: '',
      startTime: '',
      location: '',
      fullGuests: 0,
      halfGuests: 0,
      freeGuests: 0,
    },
  });

  const onSubmit = (data: PartyFormData) => {
    // Save the party data
    setPartyData(data);

    // If there's a pending service, add it to the cart
    if (pendingService) {
      addToCart({
        name: pendingService.serviceName,
        serviceName: pendingService.serviceName,
        price: pendingService.price,
        quantity: 1,
        providerId: pendingService.providerId,
        providerName: pendingService.providerName,
        category: 'service', // Default category for services
        image: pendingService.image
      });
    }

    // Call the completion callback
    onComplete();
  };

  const fullGuests = watch('fullGuests');
  const halfGuests = watch('halfGuests');
  const freeGuests = watch('freeGuests');
  const totalGuests = fullGuests + halfGuests + freeGuests;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* Nome do Evento */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Nome do Evento
        </label>
        <input
          type="text"
          {...register('eventName')}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          placeholder="Ex: Aniversário da Maria"
        />
        {errors.eventName && (
          <p className="text-red-500 text-sm mt-1">{errors.eventName.message}</p>
        )}
      </div>

      {/* Data e Horário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#520029] mb-2">
            <MdCalendarToday className="inline mr-1" />
            Data do Evento
          </label>
          <input
            type="date"
            {...register('eventDate')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          />
          {errors.eventDate && (
            <p className="text-red-500 text-sm mt-1">{errors.eventDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#520029] mb-2">
            <MdAccessTime className="inline mr-1" />
            Horário de Início
          </label>
          <input
            type="time"
            {...register('startTime')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
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
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      {/* Convidados */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-4">
          <MdGroup className="inline mr-1" />
          Número de Convidados
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inteira (12+ anos)
            </label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              {...register('fullGuests', { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? 0 : parseInt(value, 10)
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-center"
            />
          </div>

          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meia (5-11 anos)
            </label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              {...register('halfGuests', { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? 0 : parseInt(value, 10)
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-center"
            />
          </div>

          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free (0-4 anos)
            </label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              {...register('freeGuests', { 
                valueAsNumber: true,
                setValueAs: (value) => value === "" ? 0 : parseInt(value, 10)
              })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-center"
            />
          </div>
        </div>

        {errors.fullGuests && (
          <p className="text-red-500 text-sm mt-2">{errors.fullGuests.message}</p>
        )}

        {totalGuests > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Total de convidados: {totalGuests}</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fullGuests} inteira + {halfGuests} meia + {freeGuests} free
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] text-white rounded-lg hover:from-[#8B0A9E] hover:to-[#520029] transition-all font-semibold"
        >
          Salvar Festa
        </button>
      </div>
    </form>
  );
}

