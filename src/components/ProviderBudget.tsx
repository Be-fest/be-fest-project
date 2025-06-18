'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCalendarToday, MdGroup, MdCheckCircle, MdCalculate, MdInfo } from 'react-icons/md';
import { Service, ServiceProvider, ServiceCategoryEnum } from '@/types/database';
import { api } from '@/services/api';

interface ProviderBudgetProps {
  services: Service[];
  provider: ServiceProvider;
}

interface BudgetItem {
  service_id: string;
  service_name: string;
  price_per_guest: number;
  category: ServiceCategoryEnum;
}

interface FormData {
  event_name: string;
  event_date: string;
  start_time: string;
  location_address: string;
  number_of_guests: number;
  observations?: string;
  age_breakdown: {
    adults: number;
    children_6_12: number;
    children_0_5: number;
  };
  selected_services: BudgetItem[];
}

export function ProviderBudget({ services, provider }: ProviderBudgetProps) {
  const [formData, setFormData] = useState<FormData>({
    event_name: 'Minha Festa',
    event_date: '',
    start_time: '18:00',
    location_address: '',
    number_of_guests: 0,
    observations: '',
    age_breakdown: {
      adults: 0,
      children_6_12: 0,
      children_0_5: 0
    },
    selected_services: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showServiceDetails, setShowServiceDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Agrupar serviços por categoria
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<ServiceCategoryEnum, Service[]>);
  const handleServiceToggle = (service: Service) => {
    const existingIndex = formData.selected_services.findIndex(
      item => item.service_id === service.id
    );

    if (existingIndex >= 0) {
      setFormData(prev => ({
        ...prev,
        selected_services: prev.selected_services.filter(
          item => item.service_id !== service.id
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selected_services: [
          ...prev.selected_services,
          {
            service_id: service.id,
            service_name: service.name,
            price_per_guest: service.price_per_guest || 0,
            category: service.category
          }
        ]
      }));
    }
  };

  const calculateTotal = () => {
    return formData.selected_services.reduce((total, item) => {
      return total + (item.price_per_guest * formData.number_of_guests);
    }, 0);
  };

  const calculateBefestFee = () => {
    const subtotal = calculateTotal();
    return subtotal * 0.1; // 10% taxa da plataforma
  };

  const isServiceSelected = (serviceId: string) => {
    return formData.selected_services.some(item => item.service_id === serviceId);
  };

  const showDetails = (serviceId: string) => {
    setShowServiceDetails(serviceId);
  };

  const hideDetails = () => {
    setShowServiceDetails(null);
  };
  const handleSubmitBudget = async () => {
    setLoading(true);
    try {
      const budgetData = {
        event_name: formData.event_name,
        event_date: formData.event_date,
        start_time: formData.start_time,
        location_address: formData.location_address,
        number_of_guests: formData.number_of_guests,
        observations: formData.observations,
        selected_services: formData.selected_services.map(service => ({
          service_id: service.service_id,
          provider_id: provider.id,
          price_per_guest: service.price_per_guest
        }))
      };

      const result = await api.createBudgetRequest(budgetData);
      
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step
                    ? 'bg-[#FF0080] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-[#FF0080]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Event Info */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-[#520029] mb-6 flex items-center gap-2">
            <MdCalendarToday className="text-[#FF0080]" />
            Informações do Evento
          </h2>          <div className="grid md:grid-cols-2 gap-6">
            {/* Nome do Evento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Nome do Evento
              </label>
              <input
                type="text"
                value={formData.event_name}
                onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
                placeholder="Ex: Aniversário da Maria"
              />
            </div>

            {/* Data do Evento */}
            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Data do Evento
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>

            {/* Horário de Início */}
            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Horário de Início
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>

            {/* Local do Evento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Local do Evento
              </label>
              <input
                type="text"
                value={formData.location_address}
                onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
                placeholder="Endereço completo do evento"
              />
            </div>

            {/* Número Total de Convidados */}
            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Número Total de Convidados
              </label>
              <input
                type="number"
                value={formData.number_of_guests}
                onChange={(e) => {
                  const total = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    number_of_guests: total,
                    age_breakdown: {
                      ...prev.age_breakdown,
                      adults: total - prev.age_breakdown.children_6_12 - prev.age_breakdown.children_0_5
                    }
                  }));
                }}
                placeholder="Total de convidados"
                min="1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>

            {/* Quebra por idade */}
            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Adultos
              </label>
              <input
                type="number"
                value={formData.age_breakdown.adults}
                onChange={(e) => {
                  const adults = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    age_breakdown: { ...prev.age_breakdown, adults },
                    number_of_guests: adults + prev.age_breakdown.children_6_12 + prev.age_breakdown.children_0_5
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Crianças 6-12 anos (50% desconto)
              </label>
              <input
                type="number"
                value={formData.age_breakdown.children_6_12}
                onChange={(e) => {
                  const children = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    age_breakdown: { ...prev.age_breakdown, children_6_12: children },
                    number_of_guests: prev.age_breakdown.adults + children + prev.age_breakdown.children_0_5
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Crianças 0-5 anos (gratuito)
              </label>
              <input
                type="number"
                value={formData.age_breakdown.children_0_5}
                onChange={(e) => {
                  const children = parseInt(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    age_breakdown: { ...prev.age_breakdown, children_0_5: children },
                    number_of_guests: prev.age_breakdown.adults + prev.age_breakdown.children_6_12 + children
                  }));
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
                min="0"
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Observações (Opcional)
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
                placeholder="Informações adicionais sobre o evento..."
              />
            </div>
          </div>          <div className="flex justify-end mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!formData.event_date || formData.number_of_guests === 0}
              className="bg-[#FF0080] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E6006F] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Service Selection */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-[#520029] mb-6 flex items-center gap-2">
            <MdCheckCircle className="text-[#FF0080]" />
            Selecione os Serviços
          </h2>          <div className="grid gap-4">
            {Object.entries(servicesByCategory).map(([categoryName, categoryServices]) => (
              <div key={categoryName} className="mb-6">
                <h3 className="text-lg font-semibold text-[#520029] mb-4 bg-white p-3 rounded-lg border border-gray-200">
                  {categoryName}
                </h3>
                <div className="space-y-3">
                  {categoryServices.map((service) => {
                    const isSelected = isServiceSelected(service.id);
                    
                    return (
                      <div key={service.id} className="relative">
                        <div
                          className={`p-4 border-2 rounded-lg transition-all ${
                            isSelected
                              ? 'border-[#FF0080] bg-[#FF0080]/5'
                              : 'border-gray-200 hover:border-[#FF0080]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => handleServiceToggle(service)}
                            >
                              <h4 className="font-semibold text-[#520029]">{service.name}</h4>
                              <p className="text-sm text-[#6E5963] mb-1">{service.description}</p>
                              <p className="font-bold text-[#FF0080]">R$ {(service.price_per_guest || 0).toFixed(2)} por pessoa</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showDetails(service.id);
                                }}
                                className="text-[#FF0080] hover:text-[#E6006F] p-2 rounded-full hover:bg-[#FF0080]/10 transition-all"
                                title="Mais informações"
                              >
                                <MdInfo className="text-lg" />
                              </button>
                              <div
                                className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#FF0080] border-[#FF0080]'
                                    : 'border-gray-300'
                                }`}
                                onClick={() => handleServiceToggle(service)}
                              >
                                {isSelected && (
                                  <MdCheckCircle className="text-white text-lg -m-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Modal de detalhes do serviço */}
                        {showServiceDetails === service.id && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={hideDetails}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-white rounded-xl p-6 max-w-md mx-4"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <h3 className="text-xl font-bold text-[#520029] mb-4">{service.name}</h3>
                              <p className="text-[#6E5963] mb-4">{service.description}</p>
                              <p className="font-semibold text-[#FF0080] mb-4">
                                R$ {(service.price_per_guest || 0).toFixed(2)} por pessoa
                              </p>
                              
                              {/* Aqui virão os detalhes do banco de dados futuramente */}
                              <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                                <p className="text-sm text-[#6E5963]">
                                  {service.description || "Detalhes específicos sobre este serviço estarão disponíveis em breve. Entre em contato para mais informações."}
                                </p>
                              </div>
                              
                              <button
                                onClick={hideDetails}
                                className="w-full bg-[#FF0080] text-white py-3 rounded-lg font-semibold hover:bg-[#E6006F] transition-colors"
                              >
                                Fechar
                              </button>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="border-2 border-[#FF0080] text-[#FF0080] px-8 py-3 rounded-lg font-semibold hover:bg-[#FF0080] hover:text-white transition-all"
            >
              Voltar
            </button>            <button
              onClick={() => setCurrentStep(3)}
              disabled={formData.selected_services.length === 0}
              className="bg-[#FF0080] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E6006F] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Calcular Orçamento
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Budget Summary */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm p-8"
        >
          <h2 className="text-2xl font-bold text-[#520029] mb-6 flex items-center gap-2">
            <MdCalculate className="text-[#FF0080]" />
            Resumo do Orçamento
          </h2>          {/* Event Summary */}
          <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200">
            <h3 className="font-semibold text-[#520029] mb-4">Informações do Evento</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#6E5963]">Nome:</span>
                <p className="font-semibold">{formData.event_name}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Data:</span>
                <p className="font-semibold">{new Date(formData.event_date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Horário:</span>
                <p className="font-semibold">{formData.start_time}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Total de Convidados:</span>
                <p className="font-semibold">{formData.number_of_guests}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[#6E5963]">Local:</span>
              <p className="font-semibold">{formData.location_address}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm mt-4">
              <div>
                <span className="text-[#6E5963]">Adultos:</span>
                <p className="font-semibold">{formData.age_breakdown.adults}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Crianças 6-12 anos:</span>
                <p className="font-semibold">{formData.age_breakdown.children_6_12}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Crianças 0-5 anos:</span>
                <p className="font-semibold">{formData.age_breakdown.children_0_5}</p>
              </div>
            </div>
          </div>{/* Selected Services */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-[#520029]">Serviços Selecionados</h3>
            {formData.selected_services.map((item) => {
              const serviceTotal = item.price_per_guest * formData.number_of_guests;
              
              return (
                <div key={item.service_id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{item.service_name}</h4>
                    <p className="text-sm text-[#6E5963]">
                      R$ {item.price_per_guest.toFixed(2)} × {formData.number_of_guests} convidados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#FF0080]">R$ {serviceTotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            
            {/* Nota sobre quebra de idade */}
            {(formData.age_breakdown.children_6_12 > 0 || formData.age_breakdown.children_0_5 > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Crianças de 6-12 anos pagam 50% do valor. 
                  Crianças de 0-5 anos não são cobradas no orçamento.
                </p>
              </div>
            )}
          </div>          {/* Total */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-[#520029]">Subtotal:</span>
              <span className="text-lg font-semibold text-[#520029]">
                R$ {calculateTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-[#520029]">Taxa BeFest (10%):</span>
              <span className="text-lg font-semibold text-[#520029]">
                R$ {calculateBefestFee().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-[#520029]">Total Estimado:</span>
              <span className="text-3xl font-bold text-[#FF0080]">
                R$ {(calculateTotal() + calculateBefestFee()).toFixed(2)}
              </span>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Este é um orçamento estimado. O valor final pode variar 
                de acordo com as especificações detalhadas do seu evento e disponibilidade do prestador.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="border-2 border-[#FF0080] text-[#FF0080] px-8 py-3 rounded-lg font-semibold hover:bg-[#FF0080] hover:text-white transition-all"
              >
                Voltar
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitBudget}
                disabled={loading}
                className="bg-[#FF0080] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E6006F] transition-colors flex-1 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
