"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCalendarToday, MdLocationOn, MdGroup, MdHome } from 'react-icons/md';
import { useCart, PartyData } from '../contexts/CartContext';

interface PartyConfigFormProps {
  onComplete: () => void;
  pendingService?: {
    serviceId: string;
    serviceName: string;
    providerName: string;
    providerId: string;
    price: number;
    image: string;
  };
}

export function PartyConfigForm({ onComplete, pendingService }: PartyConfigFormProps) {
  const { setPartyData, addToCart } = useCart();
  
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    startTime: '',
    location: '',
    fullAddress: '',
    fullGuests: 0,
    halfGuests: 0,
    freeGuests: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Nome do evento é obrigatório';
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'Data do evento é obrigatória';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Horário é obrigatório';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Local do evento é obrigatório';
    }
    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = 'Endereço completo é obrigatório';
    }
    if (formData.fullGuests + formData.halfGuests + formData.freeGuests === 0) {
      newErrors.guests = 'Informe pelo menos 1 convidado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const partyData: PartyData = {
      eventName: formData.eventName,
      eventDate: formData.eventDate,
      startTime: formData.startTime,
      location: `${formData.location} - ${formData.fullAddress}`,
      fullGuests: formData.fullGuests,
      halfGuests: formData.halfGuests,
      freeGuests: formData.freeGuests
    };

    setPartyData(partyData);

    // Se há um serviço pendente, adicionar ao carrinho
    if (pendingService) {
      addToCart(pendingService);
    }

    onComplete();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-[#520029] mb-2">
          Configure sua festa dos sonhos
        </h3>
        <p className="text-sm text-gray-600">
          Preencha os dados para começar a montar seu orçamento personalizado
        </p>
      </div>

      {/* Nome do Evento */}
      <div>
        <label className="block text-sm font-medium text-[#520029] mb-2">
          Nome do Evento *
        </label>
        <input
          type="text"
          value={formData.eventName}
          onChange={(e) => handleInputChange('eventName', e.target.value)}
          placeholder="Ex: Aniversário da Maria"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0080] ${
            errors.eventName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.eventName && (
          <p className="text-red-500 text-xs mt-1">{errors.eventName}</p>
        )}
      </div>

      {/* Data e Horário */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#520029] mb-2">
            <MdCalendarToday className="inline mr-1" />
            Data do Evento *
          </label>
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => handleInputChange('eventDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0080] ${
              errors.eventDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.eventDate && (
            <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#520029] mb-2">
            Horário de Início *
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0080] ${
              errors.startTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startTime && (
            <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
          )}
        </div>
      </div>

      {/* Local do Evento */}
      <div>
        <label className="block text-sm font-medium text-[#520029] mb-2">
          <MdLocationOn className="inline mr-1" />
          Local do Evento *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="Ex: Salão de festas, Casa, Buffet..."
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0080] ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.location && (
          <p className="text-red-500 text-xs mt-1">{errors.location}</p>
        )}
      </div>

      {/* Endereço Completo */}
      <div>
        <label className="block text-sm font-medium text-[#520029] mb-2">
          <MdHome className="inline mr-1" />
          Endereço Completo *
        </label>
        <input
          type="text"
          value={formData.fullAddress}
          onChange={(e) => handleInputChange('fullAddress', e.target.value)}
          placeholder="Rua, número, bairro, cidade"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0080] ${
            errors.fullAddress ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.fullAddress && (
          <p className="text-red-500 text-xs mt-1">{errors.fullAddress}</p>
        )}
      </div>

      {/* Número de Convidados */}
      <div>
        <label className="block text-sm font-medium text-[#520029] mb-3">
          <MdGroup className="inline mr-1" />
          Número de Convidados *
        </label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="font-medium text-sm">Inteira (12+ anos)</p>
              <p className="text-xs text-gray-600">Valor integral</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('fullGuests', Math.max(0, formData.fullGuests - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{formData.fullGuests}</span>
              <button
                type="button"
                onClick={() => handleInputChange('fullGuests', formData.fullGuests + 1)}
                className="w-8 h-8 rounded-full bg-[#FF0080] hover:bg-[#E6006F] text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="font-medium text-sm">Meia (5-11 anos)</p>
              <p className="text-xs text-gray-600">50% do valor</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('halfGuests', Math.max(0, formData.halfGuests - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{formData.halfGuests}</span>
              <button
                type="button"
                onClick={() => handleInputChange('halfGuests', formData.halfGuests + 1)}
                className="w-8 h-8 rounded-full bg-[#FF0080] hover:bg-[#E6006F] text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="font-medium text-sm">Free (0-4 anos)</p>
              <p className="text-xs text-gray-600">Entrada gratuita</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('freeGuests', Math.max(0, formData.freeGuests - 1))}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{formData.freeGuests}</span>
              <button
                type="button"
                onClick={() => handleInputChange('freeGuests', formData.freeGuests + 1)}
                className="w-8 h-8 rounded-full bg-[#FF0080] hover:bg-[#E6006F] text-white flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {errors.guests && (
          <p className="text-red-500 text-xs mt-2">{errors.guests}</p>
        )}

        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">
            Total: {formData.fullGuests + formData.halfGuests + formData.freeGuests} convidados
          </p>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full bg-[#FF0080] hover:bg-[#E6006F] text-white font-bold py-4 rounded-lg transition-colors"
        >
          {pendingService ? 'Salvar Festa e Adicionar Serviço' : 'Salvar Festa'}
        </motion.button>
      </div>
    </div>
  );
}
