'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdDashboard,
  MdBusinessCenter,
  MdPendingActions,
  MdCheckCircle,
  MdCancel,
  MdAttachMoney,
  MdTrendingUp,
  MdCalendarToday,
  MdEvent,
  MdLocationOn,
  MdPeople,
  MdNotifications,
  // MdAdd,
  MdSettings,
  // MdVisibility,
  MdArrowUpward,
  MdArrowDownward,
  MdClose,
  MdApproval
} from 'react-icons/md';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { ServiceManagement } from '@/components/dashboard/ServiceManagement';
import { ProviderProfile } from '@/components/dashboard/ProviderProfile';
import { AuthGuard } from '@/components/AuthGuard';
import { getProviderEventsAction, updateEventStatusAction } from '@/lib/actions/events';
import { getProviderServicesAction, getProviderStatsAction } from '@/lib/actions/services';
import { updateEventServiceStatusAction, updateEventServiceAction } from '@/lib/actions/event-services';
import { EventWithServices, Service } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { calculateAdvancedPrice, formatGuestsInfo } from '@/utils/formatters';

export default function ProviderDashboard() {
  const { userData } = useAuth();
  const [events, setEvents] = useState<EventWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerStats, setProviderStats] = useState<{
    totalRequests: number
    pendingRequests: number
    approvedRequests: number
    activeServices: number
    totalRevenue: number
    completedEvents: number
  }>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    activeServices: 0,
    totalRevenue: 0,
    completedEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'approved' | 'services' | 'profile'>('overview');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    serviceId?: string;
    serviceIds?: string[];
    serviceName?: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsResult, servicesResult, statsResult] = await Promise.all([
        getProviderEventsAction(),
        getProviderServicesAction(),
        getProviderStatsAction()
      ]);

      if (eventsResult.success && eventsResult.data) {
        setEvents(eventsResult.data);
      } else if (eventsResult.error) {
        console.error('Erro ao carregar eventos:', eventsResult.error);
        // Não definir erro aqui, pois prestadores podem não ter eventos ainda
      }

      if (servicesResult.success && servicesResult.data) {
        setServices(servicesResult.data);
      } else if (servicesResult.error) {
        console.error('Erro ao carregar serviços:', servicesResult.error);
      }

      if (statsResult.success && statsResult.data) {
        setProviderStats(statsResult.data as any);
      } else if (statsResult.error) {
        console.error('Erro ao carregar estatísticas:', statsResult.error);
        setError('Erro ao carregar estatísticas do prestador');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Estatísticas baseadas nos dados reais
  const totalRequests = providerStats.totalRequests;
  const pendingRequests = providerStats.pendingRequests;
  const approvedRequests = providerStats.approvedRequests;
  const activeServices = providerStats.activeServices;
  const totalRevenue = providerStats.totalRevenue;
  const completedEvents = providerStats.completedEvents;

  const calculateEstimatedPriceForEvent = (service: any, event: any) => {
    try {
      const guestCount = event.guest_count || 0;
      
      // Calcular preço base
      let basePrice = 0;
      
      // Se temos preço por convidado no serviço, usar isso
      if (service.price_per_guest_at_booking) {
        basePrice = service.price_per_guest_at_booking * guestCount;
      } else {
        // Preço base mínimo para qualquer serviço
        basePrice = guestCount > 0 ? 30 * guestCount : 500;
      }
      
      // Adicionar taxa de 5% e arredondar para cima
      const taxRate = 0.05; // 5%
      const taxAmount = basePrice * taxRate;
      const totalPrice = Math.ceil(basePrice + taxAmount);
      
      return totalPrice;
    } catch (error) {
      console.error('Erro ao calcular preço estimado:', error);
      return 0;
    }
  };

  const calculateBasePriceForEvent = (service: any, event: any) => {
    try {
      const guestCount = event.guest_count || 0;
      
      // Se temos preço por convidado no serviço, usar isso
      if (service.price_per_guest_at_booking) {
        return service.price_per_guest_at_booking * guestCount;
      } else {
        // Preço base mínimo para qualquer serviço
        return guestCount > 0 ? 30 * guestCount : 500;
      }
    } catch (error) {
      console.error('Erro ao calcular preço base:', error);
      return 0;
    }
  };

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    } catch (error) {
      console.error('Erro ao formatar moeda:', error);
      return 'R$ 0,00';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_provider_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting_payment':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'approved': // Para compatibilidade com código antigo
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_provider_approval':
        return 'Aguardando Aprovação';
      case 'waiting_payment':
        return 'Aguardando Pagamento';
      case 'confirmed':
        return 'Confirmado';
      case 'approved': // Para compatibilidade com código antigo
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const handleApproveService = async (eventServiceId: string, serviceName?: string) => {
    setConfirmAction({
      type: 'approve',
      serviceId: eventServiceId,
      serviceName: serviceName || 'este serviço'
    });
    setShowConfirmModal(true);
  };

  const handleRejectService = async (eventServiceId: string, serviceName?: string) => {
    setConfirmAction({
      type: 'reject',
      serviceId: eventServiceId,
      serviceName: serviceName || 'este serviço'
    });
    setShowConfirmModal(true);
  };

  const handleBulkApprove = async () => {
    if (selectedServices.size === 0) return;
    
    setConfirmAction({
      type: 'approve',
      serviceIds: Array.from(selectedServices)
    });
    setShowConfirmModal(true);
  };

  const handleBulkReject = async () => {
    if (selectedServices.size === 0) return;
    
    setConfirmAction({
      type: 'reject',
      serviceIds: Array.from(selectedServices)
    });
    setShowConfirmModal(true);
  };

  const toggleServiceSelection = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const selectAllPendingServices = () => {
    const pendingServiceIds = events.flatMap(event => 
      event.event_services?.filter(service => 
        service.provider_id === userData?.id &&
        service.booking_status === 'pending_provider_approval'
      ).map(service => service.id) || []
    );
    setSelectedServices(new Set(pendingServiceIds));
  };

  const clearSelection = () => {
    setSelectedServices(new Set());
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    const { type, serviceId, serviceIds } = confirmAction;
    const idsToProcess = serviceIds || (serviceId ? [serviceId] : []);
    
    if (idsToProcess.length === 0) return;

    setActionLoading('bulk-action');
    
    try {
      const results = await Promise.all(
        idsToProcess.map(async (id) => {
          if (type === 'approve') {
            // Para aprovação, muda o status para waiting_payment
            return await updateEventServiceStatusAction(id, 'waiting_payment');
          } else {
            // Para rejeição
            return await updateEventServiceStatusAction(id, 'rejected', 'Serviço rejeitado');
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        await loadData(); // Recarregar dados
        clearSelection(); // Limpar seleção
        
        // Se aprovamos serviços, verificar se todos os serviços de eventos específicos foram aprovados
        // para automaticamente mudar o status do evento para waiting_payment
        if (type === 'approve') {
          await checkAndUpdateEventStatuses();
        }
      }

      // Mostrar resultado
      if (failCount === 0) {
        // Todos bem sucedidos
        const message = type === 'approve' 
          ? `${successCount} serviço(s) aprovado(s) com sucesso!`
          : `${successCount} serviço(s) rejeitado(s) com sucesso!`;
        // Você pode implementar um toast aqui
        console.log(message);
      } else {
        // Alguns falharam
        const message = `${successCount} serviço(s) processado(s) com sucesso, ${failCount} falharam.`;
        console.log(message);
      }
    } catch (error) {
      console.error('Erro ao processar ação:', error);
    } finally {
      setActionLoading(null);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  // Função para verificar e atualizar status dos eventos automaticamente
  const checkAndUpdateEventStatuses = async () => {
    try {
      // Recarregar eventos para ter dados atualizados
      const eventsResult = await getProviderEventsAction();
      if (!eventsResult.success || !eventsResult.data) return;

      const updatedEvents = eventsResult.data;

      // Verificar cada evento para ver se todos os serviços foram aprovados (waiting_payment)
      for (const event of updatedEvents) {
        if (event.event_services && event.event_services.length > 0) {
          // Verificar se TODOS os serviços do evento estão em waiting_payment
          const allEventServicesWaitingPayment = event.event_services.every(service => 
            service.booking_status === 'waiting_payment'
          );

          if (allEventServicesWaitingPayment) {
            // Todos os serviços do evento estão aguardando pagamento
            console.log(`Todos serviços do evento ${event.id} estão aguardando pagamento, mantendo status waiting_payment no evento`);
            await updateEventStatusAction(event.id, 'waiting_payment');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status dos eventos:', error);
    }
  };

  const statsCards = [
    {
      title: 'Total de Solicitações',
      value: totalRequests,
      icon: MdBusinessCenter,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Pendentes',
      value: pendingRequests,
      icon: MdPendingActions,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Aprovadas',
      value: approvedRequests,
      icon: MdCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Serviços Ativos',
      value: activeServices,
      icon: MdBusinessCenter,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '',
      changeType: 'neutral'
    }
  ];

  const revenueStats = [
    {
      title: 'Receita Total Estimada',
      value: formatCurrency(totalRevenue),
      icon: MdAttachMoney,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Eventos Realizados',
      value: completedEvents.toString(),
      icon: MdTrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '',
      changeType: 'neutral'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Bem-vindo, {userData?.organization_name || userData?.full_name}!
        </h2>
        <p className="text-purple-100">
          Aqui está um resumo da sua atividade como prestador de serviços
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.textColor}`} />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {stat.changeType === 'increase' && <MdArrowUpward className="text-green-500" />}
                {stat.changeType === 'decrease' && <MdArrowDownward className="text-red-500" />}
                <span className={`font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {revenueStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (statsCards.length * 0.1) + (index * 0.1) }}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.textColor}`} />
              </div>
              <div className="flex items-center gap-1 text-sm">
                {stat.changeType === 'increase' && <MdArrowUpward className="text-green-500" />}
                {stat.changeType === 'decrease' && <MdArrowDownward className="text-red-500" />}
                <span className={`font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 
                  stat.changeType === 'decrease' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Solicitações Recentes</h3>
          <button
            onClick={() => setActiveTab('requests')}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Ver todas
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-8">
            <MdNotifications className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma solicitação encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 5).map((event, index) => {
              const hasPendingServices = event.event_services?.some(s => s.booking_status === 'pending_provider_approval');
              
              return (
                <div key={event.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MdEvent className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MdCalendarToday className="text-xs" />
                            {formatDate(event.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MdLocationOn className="text-xs" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <MdPeople className="text-xs" />
                            {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                              ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                              : `${event.guest_count} convidados`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {hasPendingServices && (
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                      >
                        <MdPendingActions className="text-sm" />
                        Ação Necessária
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {event.event_services?.map((service, serviceIndex) => {
                      const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                      
                      return (
                        <div key={serviceIndex} className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(service.booking_status)}`}>
                            {service.service?.name || 'Serviço'} - {getStatusText(service.booking_status)}
                          </span>
                          {estimatedPrice > 0 && (
                            <span className="text-gray-600">
                              {formatCurrency(estimatedPrice)} (com taxa)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderRequests = () => {
    // Filtrar apenas serviços pendentes que pertencem ao prestador logado
    const pendingServices = events.flatMap(event => 
      event.event_services?.filter(service => 
        // Verificar se o serviço pertence ao prestador logado
        service.provider_id === userData?.id &&
        // Verificar se está pendente
        service.booking_status === 'pending_provider_approval'
      ) || []
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Solicitações Pendentes</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total: {pendingServices.length}</span>
          </div>
        </div>

        {/* Controles de seleção em lote */}
        {pendingServices.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedServices.size} de {pendingServices.length} serviços selecionados
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllPendingServices}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Selecionar todos pendentes
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Limpar seleção
                  </button>
                </div>
              </div>
              
              {selectedServices.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={actionLoading === 'bulk-action'}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'bulk-action' ? 'Processando...' : `Aprovar ${selectedServices.size}`}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={actionLoading === 'bulk-action'}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    Rejeitar {selectedServices.size}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {pendingServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MdNotifications className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma solicitação pendente</h3>
            <p className="text-gray-600">
              Quando clientes solicitarem seus serviços, elas aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              // Filtrar apenas os serviços pendentes deste evento que pertencem ao prestador
              const eventPendingServices = event.event_services?.filter(service => 
                service.provider_id === userData?.id &&
                service.booking_status === 'pending_provider_approval'
              ) || [];

              // Só mostrar o evento se tiver serviços pendentes do prestador
              if (eventPendingServices.length === 0) return null;

              return (
                <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <div className="flex items-center gap-6 text-gray-600">
                        <span className="flex items-center gap-1">
                          <MdCalendarToday className="text-sm" />
                          {formatDate(event.event_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdLocationOn className="text-sm" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdPeople className="text-sm" />
                          {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                            ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                            : `${event.guest_count} convidados`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {eventPendingServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    const isSelected = selectedServices.has(service.id);
                    const isApproving = actionLoading === `approve-${service.id}`;
                    const isRejecting = actionLoading === `reject-${service.id}`;
                    
                    return (
                      <div key={serviceIndex} className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {/* Checkbox para seleção */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleServiceSelection(service.id)}
                              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.booking_status)}`}>
                                  {getStatusText(service.booking_status)}
                                </span>
                              </div>
                                                          <p className="text-sm text-gray-600 mb-1">
                              <strong>Preço estimado:</strong> {formatCurrency(estimatedPrice)} (inclui 5% de taxa)
                            </p>
                            <p className="text-sm text-gray-500">
                              Preço base: {formatCurrency(calculateBasePriceForEvent(service, event))} + Taxa: {formatCurrency(estimatedPrice - calculateBasePriceForEvent(service, event))}
                            </p>
                              <p className="text-sm text-gray-500">
                                Categoria: {service.service?.category || 'Não especificada'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Botões de ação individual */}
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleApproveService(service.id, service.service?.name)}
                              disabled={isApproving || actionLoading === 'bulk-action'}
                              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              {isApproving ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Aprovando...
                                </>
                              ) : (
                                <>
                                  <MdCheckCircle className="text-lg" />
                                  Aprovar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectService(service.id, service.service?.name)}
                              disabled={isApproving || isRejecting || actionLoading === 'bulk-action'}
                              className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                              {isRejecting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Rejeitando...
                                </>
                              ) : (
                                <>
                                  <MdClose className="text-lg" />
                                  Rejeitar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Observações do Cliente:</p>
                          <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                            Nenhuma observação fornecida
                          </p>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Suas Observações:</p>
                          <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
                            Nenhuma observação adicionada
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderApproved = () => {
    // Filtrar apenas serviços aprovados que pertencem ao prestador logado
    const approvedServices = events.flatMap(event => 
      event.event_services?.filter(service => 
        // Verificar se o serviço pertence ao prestador logado
        service.provider_id === userData?.id &&
        // Verificar se está aprovado
        (service.booking_status === 'waiting_payment' || 
         service.booking_status === 'confirmed')
      ) || []
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Serviços Aprovados</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total: {approvedServices.length}</span>
          </div>
        </div>

        {approvedServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MdApproval className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum serviço aprovado</h3>
            <p className="text-gray-600">
              Os serviços que você aprovar aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              // Filtrar apenas os serviços aprovados deste evento que pertencem ao prestador
              const eventApprovedServices = event.event_services?.filter(service => 
                service.provider_id === userData?.id &&
                (service.booking_status === 'waiting_payment' || 
                 service.booking_status === 'confirmed')
              ) || [];

              // Só mostrar o evento se tiver serviços aprovados do prestador
              if (eventApprovedServices.length === 0) return null;

              return (
                <div key={event.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <div className="flex items-center gap-6 text-gray-600">
                        <span className="flex items-center gap-1">
                          <MdCalendarToday className="text-sm" />
                          {formatDate(event.event_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdLocationOn className="text-sm" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <MdPeople className="text-sm" />
                          {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                            ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                            : `${event.guest_count} convidados`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {eventApprovedServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    
                    return (
                      <div key={serviceIndex} className="bg-gray-50 rounded-xl p-4 mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.booking_status)}`}>
                                {getStatusText(service.booking_status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Preço estimado:</strong> {formatCurrency(estimatedPrice)} (inclui 5% de taxa)
                            </p>
                            <p className="text-sm text-gray-500">
                              Preço base: {formatCurrency(calculateBasePriceForEvent(service, event))} + Taxa: {formatCurrency(estimatedPrice - calculateBasePriceForEvent(service, event))}
                            </p>
                            <p className="text-sm text-gray-500">
                              Categoria: {service.service?.category || 'Não especificada'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Status do Pagamento:</p>
                          <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                            {service.booking_status === 'waiting_payment' ? 'Aguardando pagamento do cliente' :
                             service.booking_status === 'confirmed' ? 'Pagamento confirmado' :
                             'Serviço concluído'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="provider">
        <ProviderLayout>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Navigation Tabs Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 animate-pulse">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-32 bg-gray-300 rounded-xl"></div>
                  ))}
                </div>
              </div>

              {/* Welcome Banner Skeleton */}
              <div className="bg-gray-300 rounded-2xl p-6 mb-8 animate-pulse">
                <div className="h-6 w-64 bg-gray-400 rounded mb-2"></div>
                <div className="h-4 w-96 bg-gray-400 rounded"></div>
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue Stats Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 w-20 bg-gray-300 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Requests Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="h-6 w-40 bg-gray-300 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-300 rounded"></div>
                          <div className="h-3 w-48 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ProviderLayout>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard requiredRole="provider">
        <ProviderLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <MdCancel className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </ProviderLayout>
      </AuthGuard>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'requests':
        return renderRequests();
      case 'approved':
        return renderApproved();
      case 'services':
        return <ServiceManagement />;
      case 'profile':
        try {
          return <ProviderProfile />;
        } catch (profileError) {
          console.error('Erro ao renderizar perfil:', profileError);
          return (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <MdCancel className="text-red-500 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar perfil</h3>
              <p className="text-gray-600 mb-4">
                Houve um problema ao carregar as informações do seu perfil.
              </p>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          );
        }
      default:
        return renderOverview();
    }
  };

  return (
    <AuthGuard requiredRole="provider">
      <ProviderLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8">
              <div className="flex items-center gap-2">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: MdDashboard },
                  { id: 'requests', label: 'Solicitações', icon: MdPendingActions },
                  { id: 'approved', label: 'Aprovados', icon: MdApproval },
                  { id: 'services', label: 'Meus Serviços', icon: MdBusinessCenter },
                  { id: 'profile', label: 'Perfil', icon: MdSettings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="text-lg" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>

        {/* Modal de Confirmação */}
        {showConfirmModal && confirmAction && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/20 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  confirmAction.type === 'approve' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {confirmAction.type === 'approve' ? (
                    <MdCheckCircle className={`text-3xl text-green-600`} />
                  ) : (
                    <MdClose className={`text-3xl text-red-600`} />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmAction.type === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                </h3>
                
                <p className="text-gray-600">
                  {confirmAction.serviceIds ? (
                    `Tem certeza que deseja ${confirmAction.type === 'approve' ? 'aprovar' : 'rejeitar'} ${confirmAction.serviceIds.length} serviços?`
                  ) : (
                    `Tem certeza que deseja ${confirmAction.type === 'approve' ? 'aprovar' : 'rejeitar'} ${confirmAction.serviceName || 'este serviço'}?`
                  )}
                </p>
                
                {confirmAction.type === 'approve' && (
                  <p className="text-sm text-gray-500 mt-2">
                    O(s) serviço(s) será(ão) aprovado(s) com o preço já definido.
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setConfirmAction(null);
                  }}
                  disabled={actionLoading === 'bulk-action'}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeAction}
                  disabled={actionLoading === 'bulk-action'}
                  className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    confirmAction.type === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading === 'bulk-action' ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processando...
                    </div>
                  ) : (
                    confirmAction.type === 'approve' ? 'Aprovar' : 'Rejeitar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </ProviderLayout>
    </AuthGuard>
  );
} 