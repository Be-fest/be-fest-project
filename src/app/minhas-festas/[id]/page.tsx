'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdEdit,
  MdDelete,
  MdAdd,
  MdShoppingCart,
  MdCheck,
  MdClose,
  MdWarning,
  MdAttachMoney,
  MdEvent,
  MdPerson,
  MdPersonOutline,
  MdFace,
  MdPayment,
  MdSearch,
  MdWhatsapp,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getEventByIdAction, updateEventStatusAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction, deleteEventServiceAction } from '@/lib/actions/event-services';
import { createBookingAction } from '@/lib/actions/bookings';
import { Event, EventWithServices, EventServiceWithDetails } from '@/types/database';
import { ClientLayout } from '@/components/client/ClientLayout';
import { FastAuthGuard } from '@/components/FastAuthGuard';
import { useCart } from '@/contexts/CartContext';
import { calculateAdvancedPrice, formatGuestsInfo } from '@/utils/formatters';

export default function PartyDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const router = useRouter();
  const { setPartyData, setEventId } = useCart();
  
  const [event, setEvent] = useState<EventWithServices | null>(null);
  const [eventServices, setEventServices] = useState<EventServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [serviceToCancel, setServiceToCancel] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);



  // Carregar dados do evento
  const loadEventData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
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

      setEventServices(servicesResult.data || []);

    } catch (error) {
      console.error('Erro em loadEventData:', error);
      setError('Erro inesperado ao carregar dados');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEventData(true);
    } else {
      setLoading(false);
    }
  }, [eventId]);

  const handleEditSuccess = async () => {
    setEditModalOpen(false);
    setActionLoading('edit');
    try {
      await loadEventData(); // Recarregar dados
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading('delete');
    try {
      const result = await deleteEventAction(eventId);
      if (result.success) {
        router.push('/perfil?tab=minhas-festas');
      } else {
        alert(result.error || 'Erro ao excluir evento');
      }
    } finally {
      setActionLoading(null);
    }
  };



  const handleRemoveService = async (eventServiceId: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      setActionLoading('remove-service');
      try {
        const result = await deleteEventServiceAction(eventServiceId);
        if (result.success) {
          await loadEventData(); // Recarregar dados
        } else {
          alert(result.error || 'Erro ao remover serviço');
        }
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleConfirmEvent = async () => {
    setActionLoading('confirm-event');
    try {
      const result = await updateEventStatusAction(eventId, 'published');
      if (result.success) {
        await loadEventData(); // Recarregar dados
      } else {
        alert(result.error || 'Erro ao publicar evento');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBooking = async () => {
    setActionLoading('create-booking');
    try {
      // Criar bookings para todos os serviços aprovados
      const approvedServices = eventServices.filter(es => es.booking_status === 'approved');
      
      for (const eventService of approvedServices) {
        const formData = new FormData();
        formData.append('event_id', eventId);
        formData.append('service_id', eventService.service_id);
        formData.append('price', (eventService.total_estimated_price || 0).toString());
        formData.append('guest_count', (event?.guest_count || 0).toString());
        
        const result = await createBookingAction(formData);
        if (!result.success) {
          alert(`Erro ao criar booking para ${eventService.service?.name}: ${result.error}`);
          return;
        }
      }
      
      // Atualizar status para waiting_payment
      await updateEventStatusAction(eventId, 'waiting_payment');
      
      alert('Bookings criados com sucesso!');
      await loadEventData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao criar booking:', error);
      alert('Erro ao criar booking. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePayment = () => {
    // Redirecionar para página de pagamento
    router.push(`/pagamento?event_id=${eventId}`);
  };

  const handleFindAlternativeService = (serviceName: string) => {
    // Redirecionar para serviços com filtro específico
    router.push(`/servicos?category=${encodeURIComponent(serviceName)}`);
  };

  const handleCancelService = (serviceName: string) => {
    setCancelModalOpen(true);
    setServiceToCancel(serviceName);
  };

  const handleWhatsAppCancel = () => {
    const message = `Olá! Gostaria de cancelar o serviço "${serviceToCancel}" da minha festa. Estou entrando em contato com mais de 48h de antecedência conforme solicitado.`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setCancelModalOpen(false);
    setServiceToCancel(null);
  };

  const handleAddServiceRedirect = () => {
    if (!event) return;
    
    // Setar dados da festa no contexto do carrinho
    setPartyData({
      eventName: event.title,
      eventDate: event.event_date,
      startTime: event.start_time || '',
      location: event.location || '',
      fullGuests: Math.floor((event.guest_count || 0) * 0.6), // Estimativa
      halfGuests: Math.floor((event.guest_count || 0) * 0.3), // Estimativa
      freeGuests: Math.floor((event.guest_count || 0) * 0.1), // Estimativa
    });
    
    // Setar o ID do evento no contexto do carrinho
    setEventId(eventId);
    
    // Armazenar o ID do evento no localStorage para referência
    localStorage.setItem('befest-current-event-id', eventId);
    
    // Redirecionar para a página de serviços
    router.push('/servicos');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_provider_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_payment':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Confirmado';
      case 'pending_provider_approval':
        return 'Aguardando aprovação de disponibilidade do prestador';
      case 'rejected':
        return 'Rejeitado - Procurar outro serviço';
      case 'pending_payment':
        return 'Aguardando pagamento';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalPrice = () => {
    return eventServices
      .filter(es => es.booking_status === 'approved')
      .reduce((total, es) => {
        if (event && event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined) {
          // Usar cálculo avançado se disponível
          return total + calculateAdvancedPrice(es, event.full_guests, event.half_guests, event.free_guests);
        } else {
          // Fallback para cálculo tradicional
          return total + (es.total_estimated_price || 0);
        }
      }, 0);
  };

  const allServicesConfirmed = eventServices.length > 0 && 
    eventServices.every(es => es.booking_status === 'approved');

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB]">
          {/* Header Skeleton */}
          <div className="bg-white shadow-sm sticky top-0 z-10 animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-20 bg-gray-300 rounded-lg"></div>
                  <div className="h-9 w-20 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações da Festa Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card Detalhes da Festa */}
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-6 w-36 bg-gray-300 rounded mb-4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div>
                          <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                          <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Card Serviços */}
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-24 bg-gray-300 rounded"></div>
                    <div className="h-9 w-36 bg-gray-300 rounded-lg"></div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="h-5 w-40 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 w-24 bg-gray-300 rounded"></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                            <div className="h-8 w-8 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Skeleton */}
              <div className="space-y-6">
                {/* Status da Festa Skeleton */}
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-6 w-28 bg-gray-300 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  <div className="h-10 w-full bg-gray-300 rounded-lg mt-4"></div>
                </div>

                {/* Resumo Financeiro Skeleton */}
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <div className="h-5 w-10 bg-gray-300 rounded"></div>
                        <div className="h-5 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !event) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
          <div className="text-center">
            <MdWarning className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#520029] mb-4">
              {error || 'Festa não encontrada'}
            </h2>
            <Link
              href="/minhas-festas"
              className="text-[#A502CA] hover:underline flex items-center justify-center gap-2"
            >
              <MdArrowBack />
              Voltar para lista de festas
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <FastAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB]">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/minhas-festas"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdArrowBack className="text-2xl text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[#520029]">{event.title}</h1>
                  <p className="text-gray-600">
                    {new Date(event.event_date).toLocaleDateString('pt-BR')} 
                    {event.start_time && ` às ${event.start_time}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditModalOpen(true)}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-[#A502CA] border-2 border-[#A502CA] rounded-lg hover:bg-[#A502CA] hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 transition-colors flex items-center gap-2"
                >
                  <MdEdit />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 transition-colors flex items-center gap-2"
                >
                  {actionLoading === 'delete' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <MdDelete />
                      Excluir
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações da Festa */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-[#520029] mb-4">Detalhes da Festa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MdCalendarToday className="text-[#F71875] text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">
                        {new Date(event.event_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {event.start_time && (
                    <div className="flex items-center gap-3">
                      <MdEvent className="text-[#F71875] text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Horário</p>
                        <p className="font-medium">{event.start_time}</p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MdLocationOn className="text-[#F71875] text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Local</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <MdPeople className="text-[#F71875] text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Convidados</p>
                      <p className="font-medium">
                        {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                          ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                          : (() => {
                              // Mostrar distribuição estimada se não há dados específicos
                              const totalGuests = event.guest_count || 0;
                              const estimatedFull = Math.floor(totalGuests * 0.6); // 60% integral
                              const estimatedHalf = Math.floor(totalGuests * 0.3); // 30% meia
                              const estimatedFree = totalGuests - estimatedFull - estimatedHalf; // resto gratuito
                              return totalGuests > 0 
                                ? formatGuestsInfo(estimatedFull, estimatedHalf, estimatedFree)
                                : '0 convidados';
                            })()
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Descrição</p>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                )}
              </div>

              {/* Serviços */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#520029]">Serviços</h2>
                  <button
                    onClick={handleAddServiceRedirect}
                    disabled={actionLoading !== null}
                    className="bg-[#F71875] hover:bg-[#E6006F] disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <MdAdd />
                    Adicionar Serviço
                  </button>
                </div>

                {eventServices.length === 0 ? (
                  <div className="text-center py-12">
                    <MdShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhum serviço adicionado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Adicione serviços para completar sua festa
                    </p>
                    <p className="text-gray-500 text-sm">
                      Use o botão "Adicionar Serviço" acima para explorar nossos serviços
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventServices.map((eventService) => (
                      <div key={eventService.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {eventService.service?.name || 'Serviço'}
                            </h3>
                                                         <p className="text-sm text-gray-500">
                               {eventService.service?.provider?.organization_name || eventService.service?.provider?.full_name || 'Prestador'}
                             </p>
                            {(() => {
                              // Calcular preço considerando dados disponíveis
                              const calculatedPrice = (() => {
                                if (event && event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined) {
                                  // Usar dados detalhados se disponíveis
                                  return calculateAdvancedPrice(eventService, event.full_guests, event.half_guests, event.free_guests);
                                } else if (eventService.total_estimated_price && eventService.total_estimated_price > 0) {
                                  // Usar preço já estimado
                                  return eventService.total_estimated_price;
                                } else {
                                  // Fallback: assumir distribuição típica baseada no guest_count
                                  const totalGuests = event.guest_count || 0;
                                  const estimatedFull = Math.floor(totalGuests * 0.6); // 60% integral
                                  const estimatedHalf = Math.floor(totalGuests * 0.3); // 30% meia
                                  const estimatedFree = totalGuests - estimatedFull - estimatedHalf; // resto gratuito
                                  return calculateAdvancedPrice(eventService, estimatedFull, estimatedHalf, estimatedFree);
                                }
                              })();
                              
                              return calculatedPrice > 0 ? (
                                <p className="text-lg font-bold text-[#F71875] mt-2">
                                  {formatCurrency(calculatedPrice)}
                                </p>
                              ) : null;
                            })()}
                            {eventService.client_notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Observações:</strong> {eventService.client_notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(eventService.booking_status)}`}>
                              {getStatusText(eventService.booking_status)}
                            </span>
                            
                            {eventService.booking_status === 'rejected' && (
                              <button
                                onClick={() => handleFindAlternativeService(eventService.service?.name || 'Serviço')}
                                className="text-orange-500 hover:text-orange-700 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <MdSearch />
                                Procurar Outro
                              </button>
                            )}
                            
                            {eventService.booking_status === 'approved' && (
                              <button
                                onClick={() => handleCancelService(eventService.service?.name || 'Serviço')}
                                className="text-red-500 hover:text-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <MdWarning />
                                Cancelar
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleRemoveService(eventService.id)}
                              disabled={actionLoading === 'remove-service'}
                              className="text-red-500 hover:text-red-700 disabled:text-red-300 transition-colors"
                            >
                              {actionLoading === 'remove-service' ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <MdClose />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status da Festa */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-[#520029] mb-4">Status da Festa</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status atual:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' :
                      event.status === 'waiting_payment' ? 'bg-yellow-100 text-yellow-800' :
                      event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === 'draft' ? 'Rascunho' :
                       event.status === 'published' ? 'Publicado' :
                       event.status === 'waiting_payment' ? 'Aguardando Pagamento' :
                       event.status === 'completed' ? 'Realizado' :
                       event.status === 'cancelled' ? 'Cancelado' : 
                       event.status === null ? 'Sem Status' : event.status}
                    </span>
                  </div>
                  
                  {eventServices.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Serviços:</span>
                      <span className="text-sm font-medium">
                        {eventServices.filter(es => es.booking_status === 'approved').length} de {eventServices.length} confirmados
                      </span>
                    </div>
                  )}
                </div>

                {event.status === 'draft' && eventServices.length > 0 && (
                  <button
                    onClick={handleConfirmEvent}
                    disabled={actionLoading === 'confirm-event'}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {actionLoading === 'confirm-event' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Publicando...
                      </>
                    ) : (
                      'Publicar Festa'
                    )}
                  </button>
                )}

                {allServicesConfirmed && event.status === 'published' && (
                  <button
                    onClick={handleCreateBooking}
                    disabled={actionLoading === 'create-booking'}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'create-booking' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <MdCheck />
                        Finalizar Agendamento
                      </>
                    )}
                  </button>
                )}

                {event.status === 'waiting_payment' && (
                  <button
                    onClick={handlePayment}
                    disabled={actionLoading !== null}
                    className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MdPayment />
                    Fazer Pagamento
                  </button>
                )}

                {event.status === 'completed' && (
                  <button
                    onClick={() => handleCancelService('Serviço')}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MdWarning />
                    Cancelar Serviço
                  </button>
                )}
              </div>

              {/* Resumo Financeiro */}
              {eventServices.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-[#520029] mb-4">Resumo Financeiro</h3>
                  <div className="space-y-3">
                    {eventServices.map((eventService) => {
                        // Calcular preço considerando dados disponíveis
                        const calculatedPrice = (() => {
                          if (event && event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined) {
                            // Usar dados detalhados se disponíveis
                            return calculateAdvancedPrice(eventService, event.full_guests, event.half_guests, event.free_guests);
                          } else if (eventService.total_estimated_price && eventService.total_estimated_price > 0) {
                            // Usar preço já estimado
                            return eventService.total_estimated_price;
                          } else {
                            // Fallback: assumir distribuição típica baseada no guest_count
                            const totalGuests = event.guest_count || 0;
                            const estimatedFull = Math.floor(totalGuests * 0.6); // 60% integral
                            const estimatedHalf = Math.floor(totalGuests * 0.3); // 30% meia
                            const estimatedFree = totalGuests - estimatedFull - estimatedHalf; // resto gratuito
                            return calculateAdvancedPrice(eventService, estimatedFull, estimatedHalf, estimatedFree);
                          }
                        })();
                        
                        return (
                          <div key={eventService.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {eventService.service?.name || 'Serviço'}
                              {eventService.booking_status !== 'approved' && (
                                <span className="text-xs text-orange-600 ml-1">
                                  ({getStatusText(eventService.booking_status)})
                                </span>
                              )}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(calculatedPrice)}
                            </span>
                          </div>
                        );
                      })}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-[#F71875]">
                          {formatCurrency(eventServices.reduce((total, es) => {
                            // Calcular preço considerando dados disponíveis
                            const calculatedPrice = (() => {
                              if (event && event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined) {
                                // Usar dados detalhados se disponíveis
                                return calculateAdvancedPrice(es, event.full_guests, event.half_guests, event.free_guests);
                              } else if (es.total_estimated_price && es.total_estimated_price > 0) {
                                // Usar preço já estimado
                                return es.total_estimated_price;
                              } else {
                                // Fallback: assumir distribuição típica baseada no guest_count
                                const totalGuests = event.guest_count || 0;
                                const estimatedFull = Math.floor(totalGuests * 0.6); // 60% integral
                                const estimatedHalf = Math.floor(totalGuests * 0.3); // 30% meia
                                const estimatedFree = totalGuests - estimatedFull - estimatedHalf; // resto gratuito
                                return calculateAdvancedPrice(es, estimatedFull, estimatedHalf, estimatedFree);
                              }
                            })();
                            return total + calculatedPrice;
                          }, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Editar Festa */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h2 className="text-2xl font-bold">Editar Festa</h2>
                      <p className="text-purple-100">Atualize os detalhes da sua festa</p>
                    </div>
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                      <MdClose className="text-2xl" />
                    </button>
                  </div>
                </div>

                {event && (
                  <PartyConfigForm
                    eventId={event.id} // Passar ID para modo edição
                    initialData={{
                      title: event.title,
                      description: event.description || '',
                      event_date: event.event_date,
                      start_time: event.start_time || '',
                      location: event.location || '',
                      full_guests: event.full_guests !== undefined ? event.full_guests : Math.floor((event.guest_count || 0) * 0.6), // Usar valor real ou estimativa
                      half_guests: event.half_guests !== undefined ? event.half_guests : Math.floor((event.guest_count || 0) * 0.3), // Usar valor real ou estimativa
                      free_guests: event.free_guests !== undefined ? event.free_guests : Math.floor((event.guest_count || 0) * 0.1), // Usar valor real ou estimativa
                    }}
                    onComplete={handleEditSuccess}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Modal Confirmação Exclusão */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Excluir Festa"
          message="Tem certeza que deseja excluir esta festa? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />

        {/* Modal Cancelamento de Serviço */}
        <AnimatePresence>
          {cancelModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
              >
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <MdWarning className="text-2xl" />
                      <h2 className="text-xl font-bold">Cancelar Serviço</h2>
                    </div>
                    <button
                      onClick={() => setCancelModalOpen(false)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">
                      Para cancelar o serviço <strong>"{serviceToCancel}"</strong>, entre em contato com nosso suporte via WhatsApp.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-700 mb-2">
                        <MdWarning className="text-lg" />
                        <span className="font-medium">Importante:</span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        O cancelamento deve ser feito com pelo menos 48 horas de antecedência da data do evento.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCancelModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleWhatsAppCancel}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MdWhatsapp className="text-lg" />
                      Abrir WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ClientLayout>
    </FastAuthGuard>
  );
} 