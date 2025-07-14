'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { PaymentForm } from '@/components/forms/PaymentForm';
import { getEventByIdAction } from '@/lib/actions/events';
import { updateEventServiceStatusAction } from '@/lib/actions/event-services';
import { EventWithServices, EventService as DBEventService } from '@/types/database';
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

interface EventService {
  id: string;
  service?: {
    name: string;
    category: string;
  };
  booking_status: string;
  total_estimated_price?: number | null;
  price_per_guest_at_booking?: number | null;
}

export default function PaymentPage() {
  const { userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<EventWithServices | null>(null);
  const [servicesToPay, setServicesToPay] = useState<DBEventService[]>([]);
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
        setError(result.error || 'Evento não encontrado');
        return;
      }

      const event = result.data;
      setEventData(event);

      // Filtrar serviços que devem ser pagos
      const servicesToPayFiltered = event.event_services?.filter(service => 
        service.booking_status === 'waiting_payment' && 
        (serviceIds.length === 0 || serviceIds.includes(service.id))
      ) || [];

      setServicesToPay(servicesToPayFiltered);

      // Calcular total usando a mesma lógica da página de eventos
      const total = servicesToPayFiltered.reduce((sum, service) => {
        if (event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined) {
          return sum + calculateAdvancedPrice(service, event.full_guests, event.half_guests, event.free_guests);
        } else {
          return sum + (service.total_estimated_price || 0);
        }
      }, 0);
      
      setTotalAmount(total);

    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
      setError('Erro ao carregar dados de pagamento');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatGuestsInfo = (full: number, half: number, free: number) => {
    const parts = [];
    if (full > 0) parts.push(`${full} inteiras`);
    if (half > 0) parts.push(`${half} meias`);
    if (free > 0) parts.push(`${free} cortesias`);
    return parts.join(', ');
  };

  const handlePaymentSuccess = async () => {
    try {
      // Atualizar status dos serviços para 'confirmed'
      const updatePromises = servicesToPay.map(service => 
        updateEventServiceStatusAction(service.id, 'confirmed', 'Pagamento confirmado')
      );
      
      await Promise.all(updatePromises);
      
      setPaymentSuccess(true);
      
      // Redirecionar para a página de sucesso após 3 segundos
      setTimeout(() => {
        router.push(`/minhas-festas/${eventId}?payment=success`);
      }, 3000);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const handleGoBack = () => {
    router.push(`/minhas-festas/${eventId}`);
  };

  if (error) {
    return (
      <AuthLayout>
        <div className="text-center">
          <MdError className="text-4xl text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Erro ao carregar pagamento
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 mx-auto px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <MdArrowBack />
            Voltar ao evento
          </button>
        </div>
      </AuthLayout>
    );
  }

  if (loading) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de pagamento...</p>
        </div>
      </AuthLayout>
    );
  }

  if (paymentSuccess) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdCheckCircle className="text-3xl text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pagamento Realizado com Sucesso!
          </h1>
          <p className="text-gray-600 mb-6">
            Seus serviços foram confirmados e você receberá um email com os detalhes.
          </p>
          <div className="text-sm text-gray-500">
            Redirecionando em alguns segundos...
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  if (!eventData || servicesToPay.length === 0) {
    return (
      <AuthLayout>
        <div className="text-center">
          <MdPayment className="text-4xl text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Nenhum serviço para pagamento
          </h1>
          <p className="text-gray-600 mb-6">
            Não há serviços aguardando pagamento para este evento.
          </p>
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 mx-auto px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <MdArrowBack />
            Voltar ao evento
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdPayment className="text-3xl text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Finalizar Pagamento
          </h1>
          <p className="text-gray-600">
            Complete o pagamento dos serviços selecionados
          </p>
        </div>

        {/* Event Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <MdEvent className="text-purple-600" />
            <h3 className="font-medium text-gray-900">{eventData.title}</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MdCalendarToday className="text-xs" />
              <span>{formatDate(eventData.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdLocationOn className="text-xs" />
              <span>{eventData.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <MdPeople className="text-xs" />
              <span>
                {eventData.full_guests !== undefined 
                  ? formatGuestsInfo(eventData.full_guests, eventData.half_guests!, eventData.free_guests!)
                  : `${eventData.guest_count} convidados`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Services to Pay */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Serviços a pagar:</h3>
          <div className="space-y-3">
            {servicesToPay.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Serviço Solicitado
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    Categoria do Serviço
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {(() => {
                      if (eventData && eventData.full_guests !== undefined && eventData.half_guests !== undefined && eventData.free_guests !== undefined) {
                        return formatCurrency(calculateAdvancedPrice(service, eventData.full_guests, eventData.half_guests, eventData.free_guests));
                      } else {
                        return formatCurrency(service.total_estimated_price || 0);
                      }
                    })()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Form */}
        <PaymentForm
          services={servicesToPay.map(service => ({
            name: 'Serviço Solicitado',
            provider: 'Prestador de Serviço'
          }))}
          totalValue={totalAmount}
          onSubmit={handlePaymentSuccess}
        />

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
            ← Voltar ao evento
          </button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}