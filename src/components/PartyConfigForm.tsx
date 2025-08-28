"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdCalendarToday, MdLocationOn, MdGroup, MdAccessTime } from 'react-icons/md';
import { createEventAction, updateEventAction } from '@/lib/actions/events';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { calculateGuestCount } from '@/utils/formatters';
import DatePicker from '@/components/ui/DatePicker';

interface PartyConfigFormProps {
  onComplete: () => void;
  initialData?: PartyFormData;
  eventId?: string;
}

const partySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().nullable(),
  event_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipcode: z.string().optional().nullable(),
  // Campo location será gerado automaticamente
  location: z.string().optional().nullable(),
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

export function PartyConfigForm({ onComplete, initialData, eventId }: PartyConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToastGlobal();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      event_date: '',
      start_time: '',
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      location: '',
      full_guests: 0,
      half_guests: 0,
      free_guests: 0,
    },
  });

  // Função para gerar endereço completo
  const generateFullAddress = (data: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  }) => {
    const parts = [];
    
    // Formato: "Rua, Número, Bairro, Cidade, Estado"
    if (data.street && data.street.trim()) {
      parts.push(data.street.trim());
    }
    
    if (data.number && data.number.trim()) {
      parts.push(data.number.trim());
    }
    
    if (data.neighborhood && data.neighborhood.trim()) {
      parts.push(data.neighborhood.trim());
    }
    
    if (data.city && data.city.trim()) {
      parts.push(data.city.trim());
    }
    
    if (data.state && data.state.trim()) {
      parts.push(data.state.trim());
    }
    
    return parts.join(', ');
  };

  const onSubmit = async (data: PartyFormData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Se for edição, incluir o ID
      if (eventId) {
        formData.append('id', eventId);
      }
      
      // Gerar endereço completo
      const fullAddress = generateFullAddress({
        street: data.street || '',
        number: data.number || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        zipcode: data.zipcode || '',
      });
      
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('event_date', data.event_date);
      if (data.start_time) formData.append('start_time', data.start_time);
      if (fullAddress) formData.append('location', fullAddress);
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
          // Para edição, só chamar onComplete
          onComplete();
        } else {
          // Para criação, redirecionar após delay
          setTimeout(() => {
            router.push(`/perfil?tab=minhas-festas&eventId=${result.data!.id}`);
            onComplete();
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
  const startTime = watch('start_time');

  // Função para calcular horário de término
  const calculateEndTime = (startTime: string | null | undefined) => {
    if (!startTime) return null;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + (5 * 60 * 60 * 1000)); // +5 horas
    return endDate.toTimeString().slice(0, 5);
  };

  const endTime = calculateEndTime(startTime);

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
          <DatePicker
            value={watch('event_date') ? (() => {
              const dateStr = watch('event_date');
              // Parse da data evitando problemas de timezone
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day); // month é 0-indexed
            })() : null}
            onChange={(date) => {
              if (date) {
                // Usar getFullYear, getMonth e getDate para evitar problemas de timezone
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setValue('event_date', `${year}-${month}-${day}`);
              } else {
                setValue('event_date', '');
              }
            }}
            minDate={new Date()}
            disabled={loading}
            error={errors.event_date?.message}
          />
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
          {startTime && endTime && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>O evento comumente acaba às {endTime}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                <strong>Duração de 5 horas</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Consulte a duração do serviço. Horas extras são negociadas diretamente com o prestador.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Endereço do Evento */}
      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-3">
          <MdLocationOn className="inline mr-1" />
          Endereço do Evento
        </label>
        
        <div className="space-y-4">
          {/* Rua e Número */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Rua/Avenida
              </label>
              <input
                type="text"
                {...register('street')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                placeholder="Ex: Rua das Flores"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Número
              </label>
              <input
                type="text"
                {...register('number')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                placeholder="123"
                disabled={loading}
              />
            </div>
          </div>

          {/* Bairro e CEP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Bairro
              </label>
              <input
                type="text"
                {...register('neighborhood')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                placeholder="Ex: Jardins"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                CEP
              </label>
              <input
                type="text"
                {...register('zipcode')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                placeholder="00000-000"
                disabled={loading}
                maxLength={9}
                onChange={(e) => {
                  // Formatação automática do CEP
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length > 5) {
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                  }
                  e.target.value = value;
                }}
              />
            </div>
          </div>

          {/* Cidade e Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Cidade
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                placeholder="Ex: São Paulo"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Estado
              </label>
              <select
                {...register('state')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                disabled={loading}
              >
                <option value="">Selecione</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>

          {/* Preview do endereço */}
          {(() => {
            const street = watch('street');
            const number = watch('number');
            const neighborhood = watch('neighborhood');
            const city = watch('city');
            const state = watch('state');
            const zipcode = watch('zipcode');
            
            const previewData = { street, number, neighborhood, city, state, zipcode };
            const preview = generateFullAddress({
              street: previewData.street || undefined,
              number: previewData.number || undefined, 
              neighborhood: previewData.neighborhood || undefined,
              city: previewData.city || undefined,
              state: previewData.state || undefined,
              zipcode: previewData.zipcode || undefined
            });
            
            if (preview) {
              return (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 mb-1">Preview do endereço:</p>
                  <p className="text-sm text-blue-700">{preview}</p>
                </div>
              );
            }
            return null;
          })()}
        </div>
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
              Inteira (De 12 anos em diante)
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
              Meia (De 6 a 11 anos de Idade)
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
              Grátis (De 0 a 5 anos de Idade)
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
              {freeGuests > 0 && `${(fullGuests > 0 || halfGuests > 0) ? ', ' : ''}${freeGuests} grátis`}
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

