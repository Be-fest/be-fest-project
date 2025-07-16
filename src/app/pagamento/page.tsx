'use client';

import { Suspense, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { PaymentForm } from '@/components/forms/PaymentForm';
import { getEventByIdAction } from '@/lib/actions/events';
import { updateEventServiceStatusAction } from '@/lib/actions/event-services';
import { EventWithServices, EventService } from '@/types/database';
import { calculateAdvancedPrice, formatGuestsInfo } from '@/utils/formatters';
import { 
  MdPayment, 
  MdCheckCircle, 
  MdEvent, 
  MdLocationOn, 
  MdCalendarToday,
  MdPeople,
  MdAttachMoney,
  MdArrowBack,
  MdError
} from 'react-icons/md';

// Componente que usa useSearchParams precisa estar em Suspense
function PaymentPageContent() {
  const { userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventWithServices | null>(null);
  const [servicesToPay, setServicesToPay] = useState<EventService[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const eventId = searchParams.get('event_id');
  const serviceIds = searchParams.get('services')?.split(',') || [];

  useEffect(() => {
    if (!eventId) {
      router.push('/minhas-festas');
      return;
    }

    loadPaymentData();
  }, [eventId, serviceIds]);

  const loadPaymentData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getEventByIdAction(eventId!);
      
      if (!result.success || !result.data) {
        setError('Evento não encontrado');
        return;
      }

      setEventData(result.data);

      // Filtrar serviços que precisam de pagamento
      const services = result.data.event_services || [];
      
      let servicesToPayFilter: EventService[] = [];
      
      if (serviceIds.length > 0) {
        // Se IDs específicos foram fornecidos, filtrar apenas esses
        servicesToPayFilter = services.filter((service) => 
          serviceIds.includes(service.id) && 
          service.booking_status === 'waiting_payment'
        );
      } else {
        // Caso contrário, todos os serviços aguardando pagamento
        servicesToPayFilter = services.filter((service) => 
          service.booking_status === 'waiting_payment'
        );
      }

      if (servicesToPayFilter.length === 0) {
        setError('Nenhum serviço encontrado para pagamento');
        return;
      }

      setServicesToPay(servicesToPayFilter);

      // Calcular total
      const total = servicesToPayFilter.reduce((sum: number, service: EventService) => {
        const eventData = result.data!;
        
        // Usar preço já definido no booking ou preço por convidado
        const servicePrice = service.total_estimated_price || 
          ((service.price_per_guest_at_booking || 0) * (eventData.guest_count || 0));
        
        return sum + servicePrice;
      }, 0);

      setTotalAmount(total);

    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
      setError('Erro ao carregar dados de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // Atualizar status dos serviços para 'confirmed'
    try {
      for (const service of servicesToPay) {
        await updateEventServiceStatusAction(service.id, 'confirmed', 'Pagamento confirmado');
      }
      
      setPaymentSuccess(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push(`/minhas-festas/${eventId}`);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao atualizar status dos serviços:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#A502CA] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de pagamento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <MdError className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro no Pagamento</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/minhas-festas')}
            className="bg-[#A502CA] text-white px-6 py-3 rounded-lg hover:bg-[#8B0A9E] transition-colors"
          >
            Voltar para Minhas Festas
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <MdCheckCircle className="text-green-500 text-8xl mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Seu pagamento foi processado com sucesso. Você será redirecionado em instantes.
          </p>
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-[#A502CA] rounded-full mx-auto"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push(`/minhas-festas/${eventId}`)}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <MdArrowBack className="text-2xl text-[#A502CA]" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#520029] flex items-center gap-3">
              <MdPayment className="text-[#A502CA]" />
              Finalizar Pagamento
            </h1>
            <p className="text-gray-600 mt-2">
              Complete o pagamento dos serviços selecionados
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resumo do Evento */}
          <div className="space-y-6">
            {/* Info do Evento */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-[#520029] mb-4 flex items-center gap-2">
                <MdEvent className="text-[#A502CA]" />
                Detalhes do Evento
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <MdCalendarToday className="text-[#A502CA]" />
                  <span className="font-medium">Data:</span>
                  <span>{formatDate(eventData?.event_date || '')}</span>
                </div>
                
                {eventData?.location && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <MdLocationOn className="text-[#A502CA]" />
                    <span className="font-medium">Local:</span>
                    <span>{eventData.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-gray-700">
                  <MdPeople className="text-[#A502CA]" />
                  <span className="font-medium">Convidados:</span>
                  <span>{formatGuestsInfo(eventData?.full_guests || 0, eventData?.half_guests || 0, eventData?.free_guests || 0)}</span>
                </div>
              </div>
            </div>

            {/* Serviços a Pagar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-[#520029] mb-4">
                Serviços Selecionados
              </h3>
              
              <div className="space-y-4">
                {servicesToPay.map((service: EventService, index: number) => {
                                    const servicePrice = service.total_estimated_price || 
                    ((service.price_per_guest_at_booking || 0) * (eventData?.guest_count || 0));

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          Serviço Solicitado
                        </h4>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Categoria
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Preço por convidado: R$ {(service.price_per_guest_at_booking || 0).toFixed(2)}</div>
                        <div>Total: <span className="font-semibold text-[#A502CA]">R$ {servicePrice.toFixed(2)}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-[#A502CA]">
                    R$ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Pagamento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-[#520029] mb-6 flex items-center gap-2">
              <MdAttachMoney className="text-[#A502CA]" />
              Dados do Pagamento
            </h3>
            
            <PaymentForm
              services={servicesToPay.map(service => ({
                name: 'Serviço Solicitado',
                provider: 'Prestador de Serviço'
              }))}
              totalValue={totalAmount}
              onSubmit={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading fallback para Suspense
function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#A502CA] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando página de pagamento...</p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<PaymentLoading />}>
        <PaymentPageContent />
      </Suspense>
    </AuthLayout>
  );
}