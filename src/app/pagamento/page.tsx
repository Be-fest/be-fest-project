'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentForm } from '@/components/forms';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { getEventByIdAction, updateEventStatusAction } from '@/lib/actions/events';
import { getEventServicesAction } from '@/lib/actions/event-services';
import { Event, EventServiceWithDetails } from '@/types/database';
import { MdArrowBack, MdPayment, MdWarning } from 'react-icons/md';
import Link from 'next/link';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event_id');

  const [event, setEvent] = useState<Event | null>(null);
  const [eventServices, setEventServices] = useState<EventServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados do evento
      const eventResult = await getEventByIdAction(eventId);
      if (!eventResult.success) {
        setError(eventResult.error || 'Erro ao carregar evento');
        return;
      }

      setEvent(eventResult.data || null);

      // Buscar serviços do evento
      const servicesResult = await getEventServicesAction({ event_id: eventId });
      if (!servicesResult.success) {
        setError(servicesResult.error || 'Erro ao carregar serviços');
        return;
      }

      const approvedServices = (servicesResult.data || []).filter(
        service => service.booking_status === 'approved'
      );
      setEventServices(approvedServices);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!eventId) return;

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualizar status do evento para 'completed'
      await updateEventStatusAction(eventId, 'completed');
      
      // Redirecionar para a página de detalhes do evento
      router.push(`/minhas-festas/${eventId}`);
    } catch (error) {
      console.error('Erro no pagamento:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalValue = () => {
    return eventServices.reduce((total, service) => total + (service.total_estimated_price || 0), 0);
  };

  const getServicesForPayment = () => {
    return eventServices.map(service => ({
      name: service.service?.name || 'Serviço',
      provider: service.service?.provider?.organization_name || 
                service.service?.provider?.full_name || 
                'Prestador'
    }));
  };

  if (!eventId) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center p-4">
            <div className="text-center">
              <MdWarning className="text-6xl text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#520029] mb-4">
                Evento não encontrado
              </h2>
              <p className="text-gray-600 mb-6">
                Não foi possível encontrar o evento para pagamento.
              </p>
              <Link
                href="/minhas-festas"
                className="text-[#A502CA] hover:underline flex items-center justify-center gap-2"
              >
                <MdArrowBack />
                Voltar para Minhas Festas
              </Link>
            </div>
          </div>
        </ClientLayout>
      </ClientAuthGuard>
    );
  }

  if (loading) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </ClientLayout>
      </ClientAuthGuard>
    );
  }

  if (error || !event) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center p-4">
            <div className="text-center">
              <MdWarning className="text-6xl text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#520029] mb-4">
                {error || 'Erro ao carregar dados'}
              </h2>
              <Link
                href="/minhas-festas"
                className="text-[#A502CA] hover:underline flex items-center justify-center gap-2"
              >
                <MdArrowBack />
                Voltar para Minhas Festas
              </Link>
            </div>
          </div>
        </ClientLayout>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB] p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Link
                href={`/minhas-festas/${eventId}`}
                className="inline-flex items-center gap-2 text-[#A502CA] hover:text-[#8B0A9E] mb-4 transition-colors"
              >
                <MdArrowBack />
                Voltar para Detalhes da Festa
              </Link>
              <h1 className="text-3xl font-bold text-[#520029] mb-2">Pagamento</h1>
              <p className="text-gray-600">
                Finalize o pagamento para confirmar os serviços da festa <strong>{event.title}</strong>
              </p>
            </div>

            {/* Event Summary */}
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#520029] mb-4">Resumo do Evento</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Evento</p>
                  <p className="font-medium">{event.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">
                    {new Date(event.event_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Convidados</p>
                  <p className="font-medium">{event.guest_count} pessoas</p>
                </div>
              </div>

              {/* Services List */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Serviços Contratados</h3>
                <div className="space-y-3">
                  {eventServices.map((service, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{service.service?.name || 'Serviço'}</p>
                        <p className="text-sm text-gray-500">
                          {service.service?.provider?.organization_name || 
                           service.service?.provider?.full_name || 
                           'Prestador'}
                        </p>
                      </div>
                      <p className="font-bold text-[#F71875]">
                        {formatCurrency(service.total_estimated_price || 0)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">Total</p>
                    <p className="text-2xl font-bold text-[#F71875]">
                      {formatCurrency(getTotalValue())}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <MdPayment className="text-2xl text-[#F71875]" />
                <h2 className="text-xl font-bold text-[#520029]">Dados do Pagamento</h2>
              </div>
              
              <PaymentForm
                services={getServicesForPayment()}
                totalValue={getTotalValue()}
                onSubmit={handlePayment}
              />
            </div>
          </div>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
} 