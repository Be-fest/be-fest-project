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
  MdApproval,
  MdPayment,
  MdWhatsapp
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
import { formatGuestsInfo, calculateServiceTotalValue } from '@/utils/formatters';

export default function ProviderDashboard() {
  const { userData } = useAuth();
  const [events, setEvents] = useState<EventWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerStats, setProviderStats] = useState<{
    totalRequests: number
    pendingRequests: number
    activeServices: number
    totalRevenue: number
    completedEvents: number
  }>({
    totalRequests: 0,
    pendingRequests: 0,
    activeServices: 0,
    totalRevenue: 0,
    completedEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'waiting_payment' | 'paid' | 'services' | 'profile'>('overview');
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
  const waitingPaymentRequests = events.flatMap(event => 
    event.event_services?.filter(service => 
      service.provider_id === userData?.id &&
      service.booking_status === 'waiting_payment'
    ) || []
  ).length;
  const paidRequests = events.flatMap(event => 
    event.event_services?.filter(service => 
      service.provider_id === userData?.id &&
      service.booking_status === 'approved'
    ) || []
  ).length;
  const activeServices = providerStats.activeServices;
  const totalRevenue = providerStats.totalRevenue;
  const completedEvents = providerStats.completedEvents;

  const calculateEstimatedPriceForEvent = (service: any, event: any) => {
    try {
      const fullGuests = event.full_guests || 0;
      const halfGuests = event.half_guests || 0;
      
      let calculatedPrice = 0;
      
      // Prioridade 1: Usar preço por convidado no booking (já calculado pelo sistema)
      if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.price_per_guest_at_booking);
      }
      // Prioridade 2: Usar preço por convidado do serviço
      else if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.service.price_per_guest);
      }
      // Prioridade 3: Se tem preço base definido
      else if (service.service?.base_price && service.service.base_price > 0) {
        calculatedPrice = service.service.base_price;
      }
      // Prioridade 4: Se já tem preço total definido
      else if (service.total_estimated_price && service.total_estimated_price > 0) {
        calculatedPrice = service.total_estimated_price;
      }
      // Fallback: Preços estimados baseados na categoria
      else {
        const categoryPrices: Record<string, number> = {
          'buffet': 130,
          'bar': 25,
          'decoracao': 15,
          'som': 20,
          'fotografia': 80,
          'seguranca': 30,
          'limpeza': 12,
          'transporte': 35,
          'comida e bebida': 130,
          'decoração': 15,
          'entretenimento': 35,
          'espaço': 100,
          'outros': 30
        };
        
        const category = service.service?.category?.toLowerCase() || service.category?.toLowerCase();
        const categoryPrice = categoryPrices[category] || 30;
        
        if (categoryPrice > 0) {
          calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, categoryPrice);
        } else {
          // Último recurso: preço base mínimo
          const totalGuests = fullGuests + halfGuests;
          calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
        }
      }
      
      // Aplicar taxa de 5% para exibição
      const taxRate = 0.05; // 5%
      const taxAmount = calculatedPrice * taxRate;
      return Math.ceil(calculatedPrice + taxAmount);
    } catch (error) {
      console.error('Erro ao calcular preço estimado:', error);
      return 0;
    }
  };

  const calculateBasePriceForEvent = (service: any, event: any) => {
    try {
      const fullGuests = event.full_guests || 0;
      const halfGuests = event.half_guests || 0;
      
      let calculatedPrice = 0;
      
      // Prioridade 1: Usar preço por convidado no booking (já calculado pelo sistema)
      if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.price_per_guest_at_booking);
      }
      // Prioridade 2: Usar preço por convidado do serviço
      else if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.service.price_per_guest);
      }
      // Prioridade 3: Se tem preço base definido
      else if (service.service?.base_price && service.service.base_price > 0) {
        calculatedPrice = service.service.base_price;
      }
      // Prioridade 4: Se já tem preço total definido
      else if (service.total_estimated_price && service.total_estimated_price > 0) {
        calculatedPrice = service.total_estimated_price;
      }
      // Fallback: Preços estimados baseados na categoria
      else {
        const categoryPrices: Record<string, number> = {
          'buffet': 130,
          'bar': 25,
          'decoracao': 15,
          'som': 20,
          'fotografia': 80,
          'seguranca': 30,
          'limpeza': 12,
          'transporte': 35,
          'comida e bebida': 130,
          'decoração': 15,
          'entretenimento': 35,
          'espaço': 100,
          'outros': 30
        };
        
        const category = service.service?.category?.toLowerCase() || service.category?.toLowerCase();
        const categoryPrice = categoryPrices[category] || 30;
        
        if (categoryPrice > 0) {
          calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, categoryPrice);
        } else {
          // Último recurso: preço base mínimo
          const totalGuests = fullGuests + halfGuests;
          calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
        }
      }
      
      return calculatedPrice; // Retorna sem taxa
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
            // Para aprovação, muda o status para waiting_payment (aguardando pagamento)
            return await updateEventServiceStatusAction(id, 'waiting_payment');
          } else {
            // Para rejeição
            return await updateEventServiceStatusAction(id, 'cancelled', 'Serviço rejeitado');
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        await loadData(); // Recarregar dados
        clearSelection(); // Limpar seleção
        
        // Se aprovamos serviços, verificar se todos os serviços de eventos específicos estão aguardando pagamento
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

      // Verificar cada evento para ver se todos os serviços estão aguardando pagamento
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
      title: 'Aguardando Pagamento',
      value: waitingPaymentRequests,
      icon: MdPayment,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '',
      changeType: 'neutral'
    },
    {
      title: 'Pagos',
      value: paidRequests,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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

  const renderWaitingPayment = () => {
    // Filtrar apenas serviços aguardando pagamento que pertencem ao prestador logado
    const waitingPaymentServices = events.flatMap(event => 
      event.event_services?.filter(service => 
        // Verificar se o serviço pertence ao prestador logado
        service.provider_id === userData?.id &&
        // Verificar se está aguardando pagamento
        service.booking_status === 'waiting_payment'
      ) || []
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Aguardando Pagamento</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total: {waitingPaymentServices.length}</span>
          </div>
        </div>

        {waitingPaymentServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MdPayment className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum serviço aguardando pagamento</h3>
            <p className="text-gray-600">
              Os serviços que estão aguardando pagamento do cliente aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              // Filtrar apenas os serviços aguardando pagamento deste evento que pertencem ao prestador
              const eventWaitingPaymentServices = event.event_services?.filter(service => 
                service.provider_id === userData?.id &&
                service.booking_status === 'waiting_payment'
              ) || [];

              // Só mostrar o evento se tiver serviços aguardando pagamento do prestador
              if (eventWaitingPaymentServices.length === 0) return null;

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

                  {eventWaitingPaymentServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    
                    return (
                      <div key={serviceIndex} className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
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
                          <p className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                            Aguardando pagamento do cliente
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

  const renderPaid = () => {
    // Filtrar apenas serviços pagos que pertencem ao prestador logado
    const paidServices = events.flatMap(event => 
      event.event_services?.filter(service => 
        // Verificar se o serviço pertence ao prestador logado
        service.provider_id === userData?.id &&
        // Verificar se está aprovado (pago)
        service.booking_status === 'approved'
      ) || []
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Pagos</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Total: {paidServices.length}</span>
          </div>
        </div>

        {paidServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MdPayment className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum serviço pago</h3>
            <p className="text-gray-600">
              Os serviços que foram pagos e você precisa prestar aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              // Filtrar apenas os serviços pagos deste evento que pertencem ao prestador
              const eventPaidServices = event.event_services?.filter(service => 
                service.provider_id === userData?.id &&
                service.booking_status === 'approved'
              ) || [];

              // Só mostrar o evento se tiver serviços pagos do prestador
              if (eventPaidServices.length === 0) return null;

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

                  {eventPaidServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    
                    return (
                      <div key={serviceIndex} className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                <MdCheckCircle className="inline w-3 h-3 mr-1" />
                                Pago e Confirmado
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Valor recebido:</strong> {formatCurrency(estimatedPrice)} (inclui 5% de taxa)
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
                          <p className="text-sm font-medium text-gray-700">Status do Serviço:</p>
                          <p className="text-sm text-green-700 bg-green-100 p-2 rounded">
                            <MdPayment className="inline w-4 h-4 mr-1" />
                            Pagamento confirmado - Preste o serviço no dia do evento
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MdEvent className="text-lg" />
                            <span>Evento em: {formatDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MdLocationOn className="text-lg" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <a
                            href={`https://wa.me/5511999999999?text=Olá! Sou o prestador do serviço ${service.service?.name} para o evento ${event.title} em ${formatDate(event.event_date)}. Preciso de suporte administrativo.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                          >
                            <MdWhatsapp className="text-lg" />
                            Contatar Admin
                          </a>
                          <button
                            onClick={() => {
                              // Aqui você pode implementar a lógica para marcar como concluído
                              console.log('Marcar serviço como concluído:', service.id);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            <MdCheckCircle className="text-lg" />
                            Marcar como Concluído
                          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
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
      case 'waiting_payment':
        return renderWaitingPayment();
      case 'paid':
        return renderPaid();
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
                  { id: 'waiting_payment', label: 'Aguardando Pagamento', icon: MdPayment },
                  { id: 'paid', label: 'Pagos', icon: MdCheckCircle },
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