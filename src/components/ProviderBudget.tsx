'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCalendarToday, MdGroup, MdCheckCircle, MdCalculate, MdInfo } from 'react-icons/md';
import { getMockProviderById, getMockProviderServices } from '@/data/mockData';
import { ServiceItem } from '@/data/mockProviders';

interface ProviderBudgetProps {
  providerId: string;
}

interface BudgetItem {
  serviceId: number;
  serviceName: string;
  price: number;
}

interface FormData {
  eventDate: string;
  fullGuests: number;
  halfGuests: number;
  freeGuests: number; // Menores de 5 anos
  selectedServices: BudgetItem[];
}

export function ProviderBudget({ providerId }: ProviderBudgetProps) {
  // Buscar os dados do prestador
  const provider = getMockProviderById(providerId);
  const services = getMockProviderServices(providerId);
  
  if (!provider) {
    return <div>Prestador não encontrado</div>;
  }const [formData, setFormData] = useState<FormData>({
    eventDate: '',
    fullGuests: 0,
    halfGuests: 0,
    freeGuests: 0,
    selectedServices: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showServiceDetails, setShowServiceDetails] = useState<number | null>(null);

  // Achatar todos os serviços em uma lista única
  const allServices = services.flatMap(category => category.items);

  const handleServiceToggle = (service: ServiceItem) => {
    const existingIndex = formData.selectedServices.findIndex(
      item => item.serviceId === service.id
    );

    if (existingIndex >= 0) {
      // Remove o serviço
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter(
          item => item.serviceId !== service.id
        )
      }));
    } else {
      // Adiciona o serviço
      setFormData(prev => ({
        ...prev,
        selectedServices: [
          ...prev.selectedServices,
          {
            serviceId: service.id,
            serviceName: service.name,
            price: service.price
          }
        ]
      }));
    }
  };

  const calculateTotal = () => {
    return formData.selectedServices.reduce((total, item) => {
      const guestMultiplier = formData.fullGuests + (formData.halfGuests * 0.5);
      return total + (item.price * guestMultiplier);
    }, 0);
  };

  const isServiceSelected = (serviceId: number) => {
    return formData.selectedServices.some(item => item.serviceId === serviceId);
  };

  const showDetails = (serviceId: number) => {
    setShowServiceDetails(serviceId);
  };

  const hideDetails = () => {
    setShowServiceDetails(null);
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
            {/* Data da Festa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Data da Festa
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>

            {/* Número de Convidados Integrais */}
            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Nº de Convidados (Integral)
              </label>
              <input
                type="number"
                value={formData.fullGuests}
                onChange={(e) => setFormData(prev => ({ ...prev, fullGuests: parseInt(e.target.value) || 0 }))}
                placeholder="Convidados integrais"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>

            {/* Número de Convidados Meia */}
            <div>
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Nº de Convidados (Meia)
              </label>
              <input
                type="number"
                value={formData.halfGuests}
                onChange={(e) => setFormData(prev => ({ ...prev, halfGuests: parseInt(e.target.value) || 0 }))}
                placeholder="Convidados meia"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>

            {/* Número de Convidados Free */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#520029] mb-2">
                Nº de Convidados (Free - menores de 5 anos)
              </label>
              <input
                type="number"
                value={formData.freeGuests}
                onChange={(e) => setFormData(prev => ({ ...prev, freeGuests: parseInt(e.target.value) || 0 }))}
                placeholder="Convidados menores de 5 anos (gratuito)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!formData.eventDate || formData.fullGuests === 0}
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
            {services.map((category) => (
              <div key={category.id} className="mb-6">                <h3 className="text-lg font-semibold text-[#520029] mb-4 bg-white p-3 rounded-lg border border-gray-200">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.items.map((service) => {
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
                              <p className="font-bold text-[#FF0080]">R$ {service.price.toFixed(2)} por pessoa</p>
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
                                R$ {service.price.toFixed(2)} por pessoa
                              </p>
                              
                              {/* Aqui virão os detalhes do banco de dados futuramente */}                              <div className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
                                <p className="text-sm text-[#6E5963]">
                                  {service.details || "Detalhes específicos sobre este serviço estarão disponíveis em breve. Entre em contato para mais informações."}
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
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={formData.selectedServices.length === 0}
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
          </h2>

          {/* Event Summary */}          <div className="bg-white p-6 rounded-lg mb-6 border border-gray-200">
            <h3 className="font-semibold text-[#520029] mb-4">Informações do Evento</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#6E5963]">Data:</span>
                <p className="font-semibold">{new Date(formData.eventDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Convidados Integrais:</span>
                <p className="font-semibold">{formData.fullGuests}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Convidados Meia:</span>
                <p className="font-semibold">{formData.halfGuests}</p>
              </div>
              <div>
                <span className="text-[#6E5963]">Convidados Free:</span>
                <p className="font-semibold">{formData.freeGuests}</p>
              </div>
            </div>
          </div>{/* Selected Services */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-[#520029]">Serviços Selecionados</h3>
            {formData.selectedServices.map((item) => {
              const guestMultiplier = formData.fullGuests + (formData.halfGuests * 0.5);
              const serviceTotal = item.price * guestMultiplier;
              
              return (
                <div key={item.serviceId} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{item.serviceName}</h4>
                    <p className="text-sm text-[#6E5963]">
                      R$ {item.price.toFixed(2)} × {guestMultiplier} convidados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#FF0080]">R$ {serviceTotal.toFixed(2)}</p>
                  </div>
                </div>              );
            })}
            
            {/* Nota sobre convidados free */}
            {formData.freeGuests > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> {formData.freeGuests} convidado(s) menor(es) de 5 anos não são cobrados no orçamento.
                </p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-[#520029]">Total Estimado:</span>
              <span className="text-3xl font-bold text-[#FF0080]">
                R$ {calculateTotal().toFixed(2)}
              </span>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Os valores descritos têm validade até 30/11 de 01/12 até 31/12 
                é acrescentado R$10,00 em cada no preço por convidado.
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
                className="bg-[#FF0080] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#E6006F] transition-colors flex-1"
              >
                Enviar Solicitação
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
