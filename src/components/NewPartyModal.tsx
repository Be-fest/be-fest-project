'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCalendarToday, MdLocationOn, MdGroup, MdAccessTime } from 'react-icons/md';
import { useCart, PartyData } from '@/contexts/CartContext';

interface NewPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewPartyModal({ isOpen, onClose, onSuccess }: NewPartyModalProps) {
  const { setPartyData, partyData } = useCart();
  const [formData, setFormData] = useState<PartyData>({
    eventName: partyData?.eventName || 'Minha Festa',
    eventDate: partyData?.eventDate || '',
    startTime: partyData?.startTime || '',
    location: partyData?.location || '',
    fullGuests: partyData?.fullGuests || 0,
    halfGuests: partyData?.halfGuests || 0,
    freeGuests: partyData?.freeGuests || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PartyData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
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
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.eventDate = 'Data deve ser futura';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Horário é obrigatório';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Local do evento é obrigatório';
    }

    if (formData.fullGuests <= 0 && formData.halfGuests <= 0) {
      newErrors.guests = 'Deve haver pelo menos 1 convidado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setPartyData(formData);
      onSuccess?.();
      onClose();
    }
  };

  const totalGuests = formData.fullGuests + formData.halfGuests + formData.freeGuests;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold">New Fest</h2>
                    <p className="text-pink-100">Configure sua festa dos sonhos</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <MdClose className="text-2xl" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nome do Evento */}
                <div>
                  <label className="block text-sm font-semibold text-[#520029] mb-2">
                    Nome do Evento
                  </label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => handleInputChange('eventName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Aniversário da Maria"
                  />
                  {errors.eventName && (
                    <p className="text-red-500 text-sm mt-1">{errors.eventName}</p>
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
                      value={formData.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all"
                    />
                    {errors.eventDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.eventDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#520029] mb-2">
                      <MdAccessTime className="inline mr-1" />
                      Horário de Início
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all"
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
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
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Rua das Flores, 123 - Jardins, São Paulo"
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
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
                        value={formData.fullGuests}
                        onChange={(e) => handleInputChange('fullGuests', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all text-center"
                      />
                    </div>

                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meia (5-11 anos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.halfGuests}
                        onChange={(e) => handleInputChange('halfGuests', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all text-center"
                      />
                    </div>

                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Free (0-4 anos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.freeGuests}
                        onChange={(e) => handleInputChange('freeGuests', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF0080] focus:border-transparent outline-none transition-all text-center"
                      />
                    </div>
                  </div>

                  {errors.guests && (
                    <p className="text-red-500 text-sm mt-2">{errors.guests}</p>
                  )}

                  {totalGuests > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Total de convidados: {totalGuests}</strong>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.fullGuests} inteira + {formData.halfGuests} meia + {formData.freeGuests} free
                      </p>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF0080] to-[#E6006F] text-white rounded-lg hover:from-[#E6006F] hover:to-[#CC005A] transition-all font-semibold"
                  >
                    Salvar Festa
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
