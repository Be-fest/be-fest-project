'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdEdit,
  MdDelete,
  MdAdd,
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
  MdCheckCircle,
  MdSchedule,
  MdAssignmentTurnedIn,
  MdRefresh,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getEventByIdAction, updateEventStatusAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction, deleteEventServiceAction } from '@/lib/actions/event-services';
import { Event, EventWithServices, EventServiceWithDetails } from '@/types/database';
import { ClientLayout } from '@/components/client';
import { FastAuthGuard } from '@/components/FastAuthGuard';
import { calculateAdvancedPrice, formatGuestsInfo } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

export default function PartyDetailsPage() {
  console.log('🔍 [PartyDetailsPage] Component rendering');
  
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Check if we just returned from adding services
  const justAddedService = searchParams.get('added') === 'true';
  
  console.log('📝 [PartyDetailsPage] Initial props:', { eventId, justAddedService });
  
  const [event, setEvent] = useState<EventWithServices | null>(null);
  const [eventServices, setEventServices] = useState<EventServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [serviceToCancel, setServiceToCancel] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedServicesForPayment, setSelectedServicesForPayment] = useState<Set<string>>(new Set());
  const [selectAllServices, setSelectAllServices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Use ref para evitar múltiplas chamadas
  const isLoadingRef = useRef(false);
  // Add a mounted ref to track component lifecycle
  const isMountedRef = useRef(true);
  
  console.log('📊 [PartyDetailsPage] Current state:', { 
    hasEvent: !!event,
    eventServicesCount: eventServices.length,
    loading, 
    error,
    isLoadingRef: isLoadingRef.current,
    justAddedService
  });

  // Function to manually refresh services data
  const refreshServices = async () => {
    if (!eventId || !isMountedRef.current || refreshing) return;
    
    console.log('🔄 [PartyDetailsPage] Manually refreshing services data');
    setRefreshing(true);
    
    try {
      const result = await getEventServicesAction({ event_id: eventId });
      if (result.success && result.data && isMountedRef.current) {
        // Type guard to ensure we're working with an array
        if (Array.isArray(result.data)) {
          console.log('✅ [PartyDetailsPage] Services refreshed successfully:', result.data.length);
          setEventServices(result.data);
          
          // Clear the "added" query parameter from the URL without page reload
          if (justAddedService && typeof window !== 'undefined') {
            const newUrl = window.location.pathname;
            window.history.replaceState({ path: newUrl }, '', newUrl);
          }
        } else {
          console.error('❌ [PartyDetailsPage] Unexpected services data format:', result.data);
          setEventServices([]);
        }
      }
    } catch (err) {
      console.error('❌ [PartyDetailsPage] Failed to refresh services:', err);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  };

  // Função simplificada para buscar dados do evento
  const fetchEventData = async () => {
    console.log('🚀 [PartyDetailsPage] fetchEventData called');
    
    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) {
      console.log('⚠️ [PartyDetailsPage] Fetch already in progress, skipping');
      return;
    }
    
    console.log('⏳ [PartyDetailsPage] Starting data fetch');
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [PartyDetailsPage] Making API calls');
      console.time('eventDataFetch');
      
      const promises = [
        getEventByIdAction(eventId),
        getEventServicesAction({ event_id: eventId })
      ];
      
      console.log('⏱️ [PartyDetailsPage] Awaiting Promise.all');
      const [eventResult, servicesResult] = await Promise.all(promises);
      console.timeEnd('eventDataFetch');
      
      console.log('✅ [PartyDetailsPage] API calls completed:', { 
        eventSuccess: eventResult.success,
        serviceSuccess: servicesResult.success
      });
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log('⚠️ [PartyDetailsPage] Component unmounted, skipping state updates');
        return;
      }
      
      if (eventResult.success && eventResult.data) {
        console.log('📅 [PartyDetailsPage] Event data received');
        
        // Type checking to ensure we're setting the correct type
        if (!Array.isArray(eventResult.data)) {
          setEvent(eventResult.data as EventWithServices);
        } else {
          console.error('❌ [PartyDetailsPage] Unexpected data format:', eventResult.data);
          setError('Formato de dados inesperado do evento');
        }
      } else {
        console.error('❌ [PartyDetailsPage] Failed to load event:', eventResult.error);
        setError(eventResult.error || 'Erro ao carregar dados do evento');
      }
      
      if (servicesResult.success && servicesResult.data) {
        // Type guard to ensure we're working with an array
        if (Array.isArray(servicesResult.data)) {
          console.log('🛠️ [PartyDetailsPage] Services data received:', servicesResult.data.length);
          setEventServices(servicesResult.data);
          
          // If we just added a service and got results, show a success toast
          if (justAddedService && servicesResult.data.length > 0) {
            toast.success('Serviço adicionado', 'O serviço foi adicionado com sucesso à sua festa.');
          }
        } else {
          console.error('❌ [PartyDetailsPage] Unexpected services data format:', servicesResult.data);
          setEventServices([]);
        }
      } else {
        console.error('❌ [PartyDetailsPage] Failed to load services:', servicesResult.error);
        setEventServices([]);
      }
    } catch (err) {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) {
        console.log('⚠️ [PartyDetailsPage] Component unmounted, skipping error state update');
        return;
      }
      
      console.error('💥 [PartyDetailsPage] Error during data fetch:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        console.log('🏁 [PartyDetailsPage] Finishing data fetch, setting loading to false');
        setLoading(false);
        isLoadingRef.current = false;
      }
    }
  };

  useEffect(() => {
    console.log('🔄 [PartyDetailsPage] useEffect triggered with eventId:', eventId);
    
    // Set mounted flag to true when component mounts
    isMountedRef.current = true;
    
    if (eventId) {
      console.log('🔍 [PartyDetailsPage] Valid eventId, calling fetchEventData');
      fetchEventData();
    } else {
      console.warn('⚠️ [PartyDetailsPage] No eventId available');
      setLoading(false);
    }
    
    return () => {
      console.log('♻️ [PartyDetailsPage] Component cleanup');
      isMountedRef.current = false;
    };
  }, [eventId]);

  // Handle navigation to add services
  const handleAddService = () => {
    if (!event) return;
    
    console.log('➕ [PartyDetailsPage] Navigating to add service');
    router.push(`/servicos?partyId=${eventId}&partyName=${encodeURIComponent(event.title)}`);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    console.log('🔄 [PartyDetailsPage] Updating status to:', newStatus);
    setActionLoading('status');
    try {
      const result = await updateEventStatusAction(eventId, newStatus);
      if (result.success) {
        console.log('✅ [PartyDetailsPage] Status updated successfully');
        setEvent((prev) => prev ? { ...prev, status: newStatus as any } : null);
        // Só refetch se necessário (quando o status muda fundamentalmente a estrutura)
        if (newStatus === 'completed' || newStatus === 'cancelled') {
          console.log('🔄 [PartyDetailsPage] Status requires data refresh');
          fetchEventData();
        }
      } else {
        console.error('❌ [PartyDetailsPage] Failed to update status:', result.error);
        setError(result.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      console.error('💥 [PartyDetailsPage] Error updating status:', err);
      setError('Erro ao atualizar status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async () => {
    setActionLoading('delete');
    try {
      const result = await deleteEventAction(eventId);
      if (result.success) {
        router.push('/minhas-festas');
      } else {
        setError(result.error || 'Erro ao deletar evento');
      }
    } catch (err) {
      setError('Erro ao deletar evento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelService = async (serviceId: string) => {
    setActionLoading('cancel');
    try {
      const result = await deleteEventServiceAction(serviceId);
      if (result.success) {
        setEventServices(prev => prev.filter(service => service.id !== serviceId));
      } else {
        setError(result.error || 'Erro ao cancelar serviço');
      }
    } catch (err) {
      setError('Erro ao cancelar serviço');
    } finally {
      setActionLoading(null);
      setCancelModalOpen(false);
      setServiceToCancel(null);
    }
  };

  const handlePayment = () => {
    const selectedServices = eventServices.filter(service => 
      selectedServicesForPayment.has(service.id)
    );
    
    if (selectedServices.length === 0) {
      alert('Selecione pelo menos um serviço para pagamento');
      return;
    }
    
    router.push(`/pagamento?eventId=${eventId}&services=${selectedServices.map(s => s.id).join(',')}`);
  };

  const handleSelectAllServices = (checked: boolean) => {
    setSelectAllServices(checked);
    if (checked) {
      const servicesWaitingPayment = eventServices.filter(service => service.booking_status === 'waiting_payment');
      setSelectedServicesForPayment(new Set(servicesWaitingPayment.map(s => s.id)));
    } else {
      setSelectedServicesForPayment(new Set());
    }
  };

  const handleServiceSelect = (serviceId: string, checked: boolean) => {
    const newSelected = new Set(selectedServicesForPayment);
    if (checked) {
      newSelected.add(serviceId);
    } else {
      newSelected.delete(serviceId);
    }
    setSelectedServicesForPayment(newSelected);
    
    const servicesWaitingPayment = eventServices.filter(service => service.booking_status === 'waiting_payment');
    setSelectAllServices(newSelected.size === servicesWaitingPayment.length);
  };

  const handleConfirmScheduling = async () => {
    await handleUpdateStatus('completed');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: MdEdit },
      published: { label: 'Publicada', color: 'bg-blue-100 text-blue-700', icon: MdCheckCircle },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-700', icon: MdPayment },
      completed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: MdAssignmentTurnedIn },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: MdClose },
    }[status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700', icon: MdWarning };

    const IconComponent = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getServiceStatusBadge = (booking_status: string) => {
    const statusConfig = {
      pending_provider_approval: { label: 'Aguardando Aprovação do Prestador', color: 'bg-yellow-100 text-yellow-700', icon: MdSchedule },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-orange-100 text-orange-700', icon: MdPayment },
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700', icon: MdCheckCircle },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700', icon: MdClose },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700', icon: MdClose },
    }[booking_status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700', icon: MdWarning };

    const IconComponent = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getActionButtons = () => {
    if (!event) return null;

    const servicesWaitingPayment = eventServices.filter(service => service.booking_status === 'waiting_payment');
    const confirmedServices = eventServices.filter(service => service.booking_status === 'confirmed');
    const allServicesPaid = servicesWaitingPayment.length > 0 && confirmedServices.length === servicesWaitingPayment.length;

    switch (event.status) {
      case 'draft':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateStatus('published')}
            disabled={actionLoading === 'status'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <MdCheck className="text-xl" />
            {actionLoading === 'status' ? 'Publicando...' : 'Publicar Festa'}
          </motion.button>
        );

      case 'published':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <MdCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
            <p className="text-green-700 font-medium">Festa publicada</p>
            <p className="text-green-600 text-sm">Aguardando propostas dos prestadores</p>
          </div>
        );

      case 'waiting_payment':
        if (servicesWaitingPayment.length > 0) {
          return (
            <>
              {allServicesPaid ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmScheduling}
                  disabled={actionLoading === 'status'}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <MdAssignmentTurnedIn className="text-xl" />
                  {actionLoading === 'status' ? 'Confirmando...' : 'Confirmar Agendamento'}
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={selectAllServices}
                      onChange={(e) => handleSelectAllServices(e.target.checked)}
                      className="w-4 h-4 text-[#A502CA] rounded focus:ring-[#A502CA]"
                    />
                                         <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                       Selecionar todos os serviços aguardando pagamento
                     </label>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={selectedServicesForPayment.size === 0}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <MdPayment className="text-xl" />
                    Pagar Serviços Selecionados ({selectedServicesForPayment.size})
                  </motion.button>
                </div>
              )}
            </>
          );
        }
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <MdSchedule className="text-yellow-500 text-2xl mx-auto mb-2" />
            <p className="text-yellow-700 font-medium">Aguardando aprovação</p>
            <p className="text-yellow-600 text-sm">Nenhum serviço aprovado ainda</p>
          </div>
        );

      case 'completed':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <MdEvent className="text-blue-500 text-2xl mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Festa confirmada</p>
            <p className="text-blue-600 text-sm">Todos os serviços foram confirmados</p>
          </div>
        );

      case 'cancelled':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <MdClose className="text-red-500 text-2xl mx-auto mb-2" />
            <p className="text-red-700 font-medium">Festa cancelada</p>
            <p className="text-red-600 text-sm">Esta festa foi cancelada</p>
          </div>
        );

      default:
        return null;
    }
  };

  console.log('🎬 [PartyDetailsPage] Render path decision:', { 
    error: !!error, 
    hasEvent: !!event, 
    loading
  });
  
  // Show loading state
  if (loading) {
    console.log('⏳ [PartyDetailsPage] Rendering loading state');
    return (
      <FastAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/minhas-festas"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <MdArrowBack className="text-xl" />
                  Voltar
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Carregando...</h1>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </ClientLayout>
      </FastAuthGuard>
    );
  }
  
  // Render states - keep simple, avoid spinners/loading indicators
  if (error) {
    console.log('❌ [PartyDetailsPage] Rendering error state');
    return (
      <FastAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="text-center py-12">
            <MdWarning className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => {
                  console.log('🔄 [PartyDetailsPage] Retry button clicked');
                  fetchEventData();
                }}
                className="bg-[#A502CA] text-white px-6 py-3 rounded-lg hover:bg-[#8B0A9E] transition-colors"
              >
                Tentar Novamente
              </button>
              <Link
                href="/minhas-festas"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar
              </Link>
            </div>
          </div>
        </ClientLayout>
      </FastAuthGuard>
    );
  }

  if (!event) {
    console.log('⚠️ [PartyDetailsPage] Rendering placeholder state (waiting for data)');
    return (
      <FastAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/minhas-festas"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <MdArrowBack className="text-xl" />
                  Voltar
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Carregando detalhes...</h1>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-500">Carregando informações da festa...</p>
            </div>
          </div>
        </ClientLayout>
      </FastAuthGuard>
    );
  }

  console.log('✅ [PartyDetailsPage] Rendering main content');
  return (
    <FastAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/minhas-festas"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MdArrowBack className="text-xl" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdEdit className="text-lg" />
                Editar
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <MdDelete className="text-lg" />
                Excluir
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalhes da Festa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MdCalendarToday className="text-[#A502CA] text-xl" />
                  <div>
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-medium">
                      {event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : 'Não definida'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MdLocationOn className="text-[#A502CA] text-xl" />
                  <div>
                    <p className="text-sm text-gray-600">Local</p>
                    <p className="font-medium">{event.location || 'Não definido'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MdPeople className="text-[#A502CA] text-xl" />
                  <div>
                    <p className="text-sm text-gray-600">Convidados</p>
                    <p className="font-medium">
                      {formatGuestsInfo(
                        event.full_guests || 0, 
                        event.half_guests || 0, 
                        event.free_guests || 0
                      )}
                    </p>
                  </div>
                </div>
                {event.description && (
                  <div className="flex items-start gap-3">
                    <MdEvent className="text-[#A502CA] text-xl mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Descrição</p>
                      <p className="font-medium">{event.description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Serviços</h3>
                {justAddedService && (
                  <button 
                    onClick={refreshServices}
                    disabled={refreshing}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    title="Atualizar lista de serviços"
                  >
                    <MdRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Atualizando...' : 'Atualizar'}
                  </button>
                )}
              </div>
              <button
                onClick={handleAddService}
                className="flex items-center gap-2 px-4 py-2 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors"
              >
                <MdAdd className="text-lg" />
                Adicionar Serviço
              </button>
            </div>
            
            {eventServices.length > 0 ? (
              <div className="space-y-4">
                {eventServices.map((service) => {
                  // Safety check to ensure service exists
                  if (!service || !service.id) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={service.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Checkbox para seleção de pagamento */}
                          {service.booking_status === 'waiting_payment' && event.status === 'waiting_payment' && (
                            <input
                              type="checkbox"
                              checked={selectedServicesForPayment.has(service.id)}
                              onChange={(e) => handleServiceSelect(service.id, e.target.checked)}
                              className="w-4 h-4 text-[#A502CA] rounded focus:ring-[#A502CA] mt-1"
                            />
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{service.service?.name || 'Serviço'}</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  por {service.provider?.full_name || service.provider?.organization_name || 'Prestador'}
                                </p>
                                {getServiceStatusBadge(service.booking_status)}
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 text-lg">
                                  {service.service ? 
                                    formatPrice(
                                      calculateAdvancedPrice(
                                        service.service, 
                                        event.full_guests || 0, 
                                        event.half_guests || 0, 
                                        event.free_guests || 0
                                      )
                                    ) : 
                                    'R$ 0,00'
                                  }
                                </span>
                              </div>
                            </div>
                            
                            {/* Ações específicas por status */}
                            <div className="mt-3 flex items-center gap-3">
                              {service.booking_status === 'waiting_payment' && (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => router.push(`/pagamento?eventId=${eventId}&services=${service.id}`)}
                                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                                >
                                  <MdPayment className="text-lg" />
                                  Pagar Agora
                                </motion.button>
                              )}

                              {service.booking_status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => {
                                      setServiceToCancel(service.id);
                                      setCancelModalOpen(true);
                                    }}
                                    className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    Cancelar Serviço
                                  </button>
                                  <a
                                    href={`https://wa.me/5511999999999?text=Olá! Gostaria de falar sobre o serviço ${service.service?.name || ''} para minha festa.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <MdWhatsapp className="text-lg" />
                                    WhatsApp
                                  </a>
                                </>
                              )}

                              {service.booking_status === 'rejected' && (
                                <Link
                                  href="/servicos"
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                >
                                  <MdSearch className="text-lg" />
                                  Procurar Outro Serviço
                                </Link>
                              )}

                              {service.booking_status === 'pending_provider_approval' && (
                                <div className="flex items-center gap-3">
                                  <div className="text-sm text-gray-500 italic">
                                    Aguardando resposta do prestador...
                                  </div>
                                  <Link
                                    href="/servicos"
                                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <MdSearch className="text-base" />
                                    Buscar Alternativo
                                  </Link>
                                </div>
                              )}

                              {service.booking_status === 'cancelled' && (
                                <div className="text-sm text-gray-500 italic">
                                  Serviço cancelado
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MdSearch className="text-4xl mx-auto mb-2 text-gray-300" />
                <p>Nenhum serviço adicionado ainda</p>
                <p className="text-sm">Explore nossos serviços e adicione à sua festa</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Editar Festa</h2>
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MdClose className="text-2xl" />
                    </button>
                  </div>
                  <PartyConfigForm
                    eventId={eventId}
                    initialData={{
                      title: event.title,
                      description: event.description || '',
                      event_date: event.event_date,
                      start_time: event.start_time || '',
                      location: event.location || '',
                      full_guests: event.full_guests || 0,
                      half_guests: event.half_guests || 0,
                      free_guests: event.free_guests || 0,
                    }}
                    onComplete={() => {
                      setEditModalOpen(false);
                      // Remover fetchEventData desnecessário - dados já atualizados via form
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteEvent}
          title="Excluir Festa"
          message="Tem certeza que deseja excluir esta festa? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          confirmVariant="danger"
        />

        {/* Cancel Service Modal */}
        <ConfirmationModal
          isOpen={cancelModalOpen}
          onCancel={() => {
            setCancelModalOpen(false);
            setServiceToCancel(null);
          }}
          onConfirm={() => serviceToCancel && handleCancelService(serviceToCancel)}
          title="Cancelar Serviço"
          message="Tem certeza que deseja cancelar este serviço? Lembre-se de que o cancelamento deve ser feito com pelo menos 48 horas de antecedência."
          confirmLabel="Cancelar Serviço"
          cancelLabel="Manter Serviço"
          confirmVariant="danger"
        />
      </ClientLayout>
    </FastAuthGuard>
  );
}