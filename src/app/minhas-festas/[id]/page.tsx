'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { createClient } from '@/lib/supabase/client';
import { calculateCorrectServicePrice } from '@/utils/formatters';
import { recalculateServicePriceAction, recalculateAllEventServicesAction } from '@/lib/actions/event-services';
import { MdArrowBack, MdEdit, MdDelete, MdAdd, MdLocalFireDepartment, MdPayment, MdRemove } from 'react-icons/md';

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  location: string | null;
  guest_count: number;
  full_guests: number;
  half_guests: number;
  free_guests: number;
  budget: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface EventService {
  id: string;
  event_id: string;
  service_id: string;
  provider_id: string;
  price_per_guest_at_booking: number | null;
  befest_fee_at_booking: number | null;
  total_estimated_price: number | null;
  provider_notes: string | null;
  client_notes: string | null;
  booking_status: string;
  created_at: string;
  updated_at: string;
  service: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    base_price: number;
    price_per_guest: number | null;
    images_urls: string[] | null;
  };
  provider: {
    id: string;
    full_name: string | null;
    organization_name: string | null;
    whatsapp_number: string | null;
  };
}

export default function MinhasFestasDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToastGlobal();
  const supabase = createClient();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventServices, setEventServices] = useState<EventService[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const eventId = params?.id as string;

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do evento
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Erro ao carregar evento:', eventError);
        toast.error('Erro', 'Não foi possível carregar os dados do evento');
        return;
      }

      setEvent(eventData);

      // Buscar serviços do evento
      const { data: servicesData, error: servicesError } = await supabase
        .from('event_services')
        .select(`
          *,
          service:services (
            id,
            name,
            description,
            category,
            base_price,
            price_per_guest,
            images_urls
          ),
          provider:users!event_services_provider_id_fkey (
            id,
            full_name,
            organization_name,
            whatsapp_number
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (servicesError) {
        console.error('Erro ao carregar serviços:', servicesError);
        toast.error('Erro', 'Não foi possível carregar os serviços do evento');
        return;
      }

      setEventServices(servicesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro', 'Erro inesperado ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateAllPrices = async () => {
    try {
      setRecalculating(true);
      
      const result = await recalculateAllEventServicesAction(eventId);
      
      if (result.success) {
        toast.success('Sucesso', result.message || 'Preços recalculados com sucesso');
        await loadEventData(); // Recarregar dados
      } else {
        toast.error('Erro', result.error || 'Erro ao recalcular preços');
      }
    } catch (error) {
      console.error('Erro ao recalcular preços:', error);
      toast.error('Erro', 'Erro inesperado ao recalcular preços');
    } finally {
      setRecalculating(false);
    }
  };

  const handleRecalculateServicePrice = async (eventServiceId: string) => {
    try {
      const result = await recalculateServicePriceAction(eventServiceId);
      
      if (result.success) {
        toast.success('Sucesso', result.message || 'Preço recalculado com sucesso');
        await loadEventData(); // Recarregar dados
      } else {
        toast.error('Erro', result.error || 'Erro ao recalcular preço');
      }
    } catch (error) {
      console.error('Erro ao recalcular preço:', error);
      toast.error('Erro', 'Erro inesperado ao recalcular preço');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending_provider_approval': { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
      'waiting_payment': { label: 'Aguardando Pagamento', color: 'bg-orange-100 text-orange-800' },
      'confirmed': { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
      'cancelled': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0080]"></div>
          </div>
        </ClientLayout>
      </ClientAuthGuard>
    );
  }

  if (!event) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento não encontrado</h1>
              <Button onClick={() => router.push('/minhas-festas')}>
                Voltar para Minhas Festas
              </Button>
            </div>
          </div>
        </ClientLayout>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/minhas-festas')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <MdArrowBack className="text-xl" />
                Voltar para Minhas Festas
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <MdEdit className="text-lg" />
                Editar
              </Button>
              <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <MdDelete className="text-lg" />
                Excluir
              </Button>
            </div>
          </div>

          {/* Detalhes da Festa */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detalhes da Festa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">{formatDate(event.event_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Local</p>
                    <p className="font-medium">{event.location || 'Local não informado'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">👥</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Convidados</p>
                    <p className="font-medium">{event.guest_count} convidados</p>
                    <p className="text-xs text-gray-400">
                      {event.full_guests} inteiros, {event.half_guests} meia, {event.free_guests} gratuitos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-sm">📝</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Descrição</p>
                    <p className="font-medium">{event.description || 'Sem descrição'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Serviços</h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleRecalculateAllPrices}
                  disabled={recalculating}
                  variant="outline"
                  className="text-sm"
                >
                  {recalculating ? 'Recalculando...' : 'Recalcular Todos os Preços'}
                </Button>
                <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                  <MdAdd className="text-lg" />
                  Adicionar Serviço
                </Button>
              </div>
            </div>

            {eventServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhum serviço adicionado ainda</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Adicionar Primeiro Serviço
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {eventServices.map((eventService) => {
                  const calculatedPrice = calculateCorrectServicePrice(
                    { full_guests: event.full_guests, half_guests: event.half_guests },
                    {
                      price_per_guest_at_booking: eventService.price_per_guest_at_booking,
                      total_estimated_price: eventService.total_estimated_price
                    },
                    eventService.service
                  );

                  return (
                    <div key={eventService.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <MdLocalFireDepartment className="text-red-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{eventService.service.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            por {eventService.provider.organization_name || eventService.provider.full_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(calculatedPrice)}
                            </span>
                            {getStatusBadge(eventService.booking_status)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleRecalculateServicePrice(eventService.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            Recalcular
                          </Button>
                          {eventService.booking_status === 'waiting_payment' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                              <MdPayment className="text-sm mr-1" />
                              Pagar Agora
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 text-xs"
                          >
                            <MdRemove className="text-sm" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
}
