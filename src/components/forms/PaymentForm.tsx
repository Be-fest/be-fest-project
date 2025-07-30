import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PaymentLinkResponse } from '@/lib/services/payment';

interface PaymentFormProps {
  services: Array<{
    name: string;
    provider: string;
  }>;
  totalValue: number;
  onSubmit: () => void;
  loading?: boolean;
  paymentData?: PaymentLinkResponse | null;
}

export function PaymentForm({ services, totalValue, onSubmit, loading: externalLoading, paymentData }: PaymentFormProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Usar loading externo se fornecido, senão usar interno
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Se não há loading externo, gerenciar internamente
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }
    
    try {
      await onSubmit();
    } finally {
      // Se não há loading externo, parar o interno
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  // Formatar data do evento
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar hora do evento
  const formatEventTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Remove segundos
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <Link
        href="/perfil?tab=minhas-festas"
        className="inline-block mb-4 md:mb-6"
      >
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="text-[#F71875] text-3xl md:text-4xl"
        >
          ←
        </motion.div>
      </Link>

      <div className="space-y-6">
        <motion.h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#520029]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Finalizar Pagamento
        </motion.h1>
        
        <motion.p
          className="text-gray-500 mt-2 text-base md:text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Confirme os detalhes da sua festa e finalize o pagamento.
          <br className="hidden md:block" />
          Você está a um passo de realizar o evento dos seus sonhos!
        </motion.p>
      </div>

      <motion.div
        className="bg-gradient-to-r from-[#F71875] to-[#FF6B9D] rounded-2xl p-6 text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-medium text-[#520029] text-sm md:text-base">Ver resumo da festa:</h2>
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-50 py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm text-gray-600"
          >
            {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>
        </div>
      </motion.div>

      {showDetails && (
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Detalhes do Evento */}
          {paymentData?.event && (
            <div className="mb-6">
              <h3 className="font-medium text-[#520029] text-sm md:text-base mb-3">Detalhes do Evento:</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Evento:</span> {paymentData.event.title}</p>
                <p><span className="font-medium">Data:</span> {formatEventDate(paymentData.event.event_date)}</p>
                {paymentData.event.start_time && (
                  <p><span className="font-medium">Horário:</span> {formatEventTime(paymentData.event.start_time)}</p>
                )}
                {paymentData.event.location && (
                  <p><span className="font-medium">Local:</span> {paymentData.event.location}</p>
                )}
                <p><span className="font-medium">Convidados:</span> {paymentData.event.total_guests} convidados</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">{paymentData.event.full_guests} inteira</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">{paymentData.event.half_guests} meias</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{paymentData.event.free_guests} free</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Serviços */}
          <div className="mb-6">
            <h3 className="font-medium text-[#520029] text-sm md:text-base mb-3">Serviços incluídos:</h3>
            <div className="space-y-3">
              {paymentData?.services ? (
                paymentData.services.map((service, index) => (
                  <div key={index} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-[#520029] text-sm">{service.name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        <span className="font-medium">Categoria:</span> {service.category}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        <span className="font-medium">Preço:</span> R$ {service.price_per_guest.toFixed(2)} por convidado
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        <span className="font-medium">Prestador:</span> {service.provider.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#520029] text-sm">
                        R$ {service.service_value.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-[#520029] text-sm">{service.name}</p>
                      <p className="text-gray-500 text-xs">{service.provider}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo Financeiro */}
          {paymentData?.pricing && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-[#520029] text-sm md:text-base mb-3">Resumo Financeiro:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Total:</span>
                  <span>R$ {paymentData.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-[#520029] text-sm md:text-base">Valor:</span>
            <span className="font-bold text-[#520029] text-lg md:text-xl">
              R${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <motion.form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F71875] hover:bg-[#E6006F] text-white font-medium py-3 md:py-4 px-6 md:px-8 rounded-xl transition-colors relative overflow-hidden group text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? 'Processando...' : 'Pagar'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] to-[#F71875] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
} 