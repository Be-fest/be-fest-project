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
  MdSettings,
  MdArrowUpward,
  MdArrowDownward,
  MdClose,
  MdApproval,
  MdPayment,
  MdWhatsapp,
  MdAccessTime
} from 'react-icons/md';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { ServiceManagement } from '@/components/dashboard/ServiceManagement';
import { ProviderProfile } from '@/components/dashboard/ProviderProfile';
import FestAgenda from '@/components/dashboard/FestAgenda';
import AgendaCard from '@/components/dashboard/AgendaCard';
import { AuthGuard } from '@/components/AuthGuard';
import { getProviderEventsAction, updateEventStatusAction } from '@/lib/actions/events';
import { getProviderServicesAction, getProviderStatsAction } from '@/lib/actions/services';
import { updateEventServiceStatusAction, updateEventServiceAction } from '@/lib/actions/event-services';
import { EventWithServices, Service } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { formatGuestsInfo, calculateServiceTotalValue, formatEventDate } from '@/utils/formatters';

export default function ProviderDashboard() {
  const { userData, loading: authLoading, error: authError } = useAuth();
  const [events, setEvents] = useState<EventWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerStats, setProviderStats] = useState<{
    totalRequests: number
    pendingRequests: number
    activeServices: number
    totalRevenue: number
    paidRevenue: number
    completedEvents: number
  }>({
    totalRequests: 0,
    pendingRequests: 0,
    activeServices: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    completedEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'waiting_payment' | 'paid' | 'completed' | 'agenda' | 'services' | 'profile'>('overview');
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
    if (!userData) return;
    
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
    if (!authLoading && userData) {
      loadData();
    }
  }, [authLoading, userData]);

  // Se ainda está carregando a autenticação, mostrar loading
  if (authLoading) {
    return (
      <AuthGuard requiredRole="provider">
        <ProviderLayout>
          <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Navigation Tabs - Static Structure */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 sm:mb-8">
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
                  {[
                    { label: 'Visão Geral', icon: MdDashboard },
                    { label: 'Solicitações', icon: MdPendingActions },
                    { label: 'Aguardando Pagamento', icon: MdPayment },
                    { label: 'Pagos', icon: MdAttachMoney }
                  ].map((tab, i) => (
                    <div key={i} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl bg-gray-100">
                      <tab.icon className="text-gray-400 text-sm sm:text-base" />
                      <span className="text-gray-400 font-medium text-xs sm:text-sm whitespace-nowrap">{tab.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Welcome Banner - Static Structure with Dynamic Content */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
                <h1 className="text-lg sm:text-2xl font-bold mb-2">
                  Bem-vindo, <span className="animate-pulse bg-white/20 rounded px-2 py-1 inline-block w-24 sm:w-32 h-5 sm:h-6"></span>!
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">Gerencie seus serviços e acompanhe suas solicitações</p>
              </div>

              {/* Stats Cards - Static Structure with Dynamic Values */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8">
                {[
                  { title: 'Total de Solicitações', icon: MdBusinessCenter },
                  { title: 'Solicitações Pendentes', icon: MdPendingActions },
                  { title: 'Serviços Ativos', icon: MdCheckCircle },
                  { title: 'Receita Total', icon: MdAttachMoney },
                  { title: 'Eventos Concluídos', icon: MdCheckCircle }
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 lg:mb-4">
                      <stat.icon className="text-purple-600 text-base sm:text-lg lg:text-xl mb-1 sm:mb-0" />
                      <span className="text-xs text-gray-500 hidden sm:inline">+0%</span>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="h-4 sm:h-5 lg:h-6 w-10 sm:w-12 lg:w-16 bg-gray-300 rounded animate-pulse"></div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-lg animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 space-y-1 sm:space-y-2">
                        <div className="h-3 sm:h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-2 sm:h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
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

  // Se há erro de autenticação, mostrar erro
  if (authError) {
    return (
      <AuthGuard requiredRole="provider">
        <ProviderLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <MdCancel className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Autenticação</h2>
              <p className="text-gray-600 mb-4">{authError}</p>
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

  // Se não há dados do usuário, mostrar loading
  if (!userData) {
    return (
      <AuthGuard requiredRole="provider">
        <ProviderLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados do usuário...</p>
            </div>
          </div>
        </ProviderLayout>
      </AuthGuard>
    );
  }

  // Se há erro no carregamento dos dados, mostrar erro
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
                onClick={() => loadData()}
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

  // Se ainda está carregando os dados, mostrar loading
  if (loading) {
    return (
      <AuthGuard requiredRole="provider">
        <ProviderLayout>
          <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            <div className="max-w-7xl mx-auto">
              {/* Navigation Tabs - Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 sm:mb-8">
                <div className="overflow-x-auto scrollbar-hide">
                  <nav className="flex space-x-2 min-w-max">
                    {[
                      { label: 'Visão Geral', icon: MdDashboard },
                      { label: 'Solicitações', icon: MdPendingActions },
                      { label: 'Aguardando Pagamento', icon: MdPayment },
                      { label: 'Pagos', icon: MdAttachMoney },
                      { label: 'Meus Serviços', icon: MdBusinessCenter },
                      { label: 'Perfil', icon: MdSettings }
                    ].map((tab, i) => (
                      <div key={i} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-gray-100">
                        <tab.icon className="text-gray-400 text-sm sm:text-base md:text-lg" />
                        <span className="text-gray-400 font-medium text-xs sm:text-sm whitespace-nowrap hidden md:inline">{tab.label}</span>
                        <span className="text-gray-400 font-medium text-xs sm:text-sm whitespace-nowrap md:hidden">{tab.label.split(' ')[0]}</span>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Welcome Banner - Static Structure with Dynamic Content */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
                <h1 className="text-lg sm:text-2xl font-bold mb-2">
                  Bem-vindo, <span className="animate-pulse bg-white/20 rounded px-2 py-1 inline-block w-24 sm:w-32 h-5 sm:h-6"></span>!
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">Gerencie seus serviços e acompanhe suas solicitações</p>
              </div>

                {/* Stats Cards - Static Structure with Dynamic Values */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8">
                  {[
                    { title: 'Total de Solicitações', icon: MdBusinessCenter },
                    { title: 'Solicitações Pendentes', icon: MdPendingActions },
                    { title: 'Serviços Ativos', icon: MdCheckCircle },
                    { title: 'Receita Total', icon: MdAttachMoney },
                    { title: 'Eventos Concluídos', icon: MdCheckCircle }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 lg:mb-4">
                        <stat.icon className="text-purple-600 text-base sm:text-lg lg:text-xl mb-1 sm:mb-0" size={24} />
                        <span className="text-xs text-gray-500 hidden sm:inline">+0%</span>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <div className="h-4 sm:h-5 lg:h-6 w-10 sm:w-12 lg:w-16 bg-gray-300 rounded animate-pulse"></div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-tight">{stat.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue Stats - Static Structure with Dynamic Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-8">
                  {[
                    { title: 'Receita Este Mês', icon: MdTrendingUp },
                    { title: 'Receita Total', icon: MdAttachMoney }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <stat.icon className="text-green-600 text-lg sm:text-xl" />
                        <span className="text-xs text-gray-500">+0%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-300 rounded animate-pulse"></div>
                        <p className="text-xs sm:text-sm text-gray-600">{stat.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Requests - Static Structure with Dynamic Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Solicitações Recentes</h3>
                    <button className="text-sm text-purple-600 hover:text-purple-700 font-medium self-start">
                      Ver todas
                    </button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-lg animate-pulse flex-shrink-0"></div>
                          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                            <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-300 rounded animate-pulse"></div>
                            <div className="h-2 sm:h-3 w-32 sm:w-48 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-300 rounded-full animate-pulse self-start sm:self-center"></div>
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

  // Estatísticas baseadas nos dados reais
  const totalRequests = providerStats.totalRequests;
  const pendingRequests = providerStats.pendingRequests;
  const waitingPaymentRequests = events.flatMap(event => 
    event.event_services?.filter(service => 
      service.provider_id === userData?.id &&
      service.booking_status === 'waiting_payment'
    ) || []
  ).length;
  // Contar serviços pagos (incluindo os já concluídos, pois foram pagos antes)
  const paidRequests = events.flatMap(event => 
    event.event_services?.filter(service => 
      service.provider_id === userData?.id &&
      (service.booking_status === 'approved' || service.booking_status === 'completed')
    ) || []
  ).length;
  const activeServices = providerStats.activeServices;
  const totalRevenue = providerStats.totalRevenue;
  
  // Contar eventos concluídos localmente (serviços com status 'completed')
  const completedEvents = events.flatMap(event => 
    event.event_services?.filter(service => 
      service.provider_id === userData?.id &&
      service.booking_status === 'completed'
    ) || []
  ).length;

  const calculateEstimatedPriceForEvent = (service: any, event: any) => {
    try {
      // PRIORIDADE 1: Se já tem preço total salvo no banco, usar ele (é o valor correto e autorizado)
      if (service.total_estimated_price && service.total_estimated_price > 0) {
        // O total_estimated_price inclui a taxa de 10% para o cliente
        // Para o prestador, precisamos remover essa taxa (dividir por 1.10)
        return Math.round(service.total_estimated_price / 1.10);
      }

      // Apenas calcular dinamicamente se não houver preço salvo
      const fullGuests = event.full_guests || 0;
      const halfGuests = event.half_guests || 0;
      
      let calculatedPrice = 0;
      
      // Prioridade 2: Usar preço por convidado no booking (já calculado pelo sistema) - SEMPRE CALCULAR CORRETAMENTE
      if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.price_per_guest_at_booking, service, true);
      }
      // Prioridade 3: Usar preço por convidado do serviço
      else if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.service.price_per_guest, service);
      }
      // Prioridade 4: Se tem preço base definido
      else if (service.service?.base_price && service.service.base_price > 0) {
        calculatedPrice = service.service.base_price;
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
          calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, categoryPrice, service);
        } else {
          // Último recurso: preço base mínimo
          const totalGuests = fullGuests + halfGuests;
          calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
        }
      }
      
      // Retornar o preço calculado sem taxa (valor original)
      return calculatedPrice;
    } catch (error) {
      console.error('Erro ao calcular preço estimado:', error);
      return 0;
    }
  };

  const calculateBasePriceForEvent = (service: any, event: any) => {
    try {
      // PRIORIDADE 1: Se já tem preço total salvo no banco, usar ele (é o valor correto e autorizado)
      if (service.total_estimated_price && service.total_estimated_price > 0) {
        // O total_estimated_price inclui a taxa de 10% para o cliente
        // Para o prestador, precisamos remover essa taxa (dividir por 1.10)
        return Math.round(service.total_estimated_price / 1.10);
      }

      // Apenas calcular dinamicamente se não houver preço salvo
      const fullGuests = event.full_guests || 0;
      const halfGuests = event.half_guests || 0;
      
      let calculatedPrice = 0;
      
      // Prioridade 2: Usar preço por convidado no booking (já calculado pelo sistema) - SEMPRE CALCULAR CORRETAMENTE
      if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.price_per_guest_at_booking, service, true);
      }
      // Prioridade 3: Usar preço por convidado do serviço
      else if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
        calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, service.service.price_per_guest, service);
      }
      // Prioridade 4: Se tem preço base definido
      else if (service.service?.base_price && service.service.base_price > 0) {
        calculatedPrice = service.service.base_price;
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
          calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, categoryPrice, service);
        } else {
          // Último recurso: preço base mínimo
          const totalGuests = fullGuests + halfGuests;
          calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
        }
      }
      
      // Retornar o preço calculado sem taxa (valor original)
      return calculatedPrice;
    } catch (error) {
      console.error('Erro ao calcular preço base:', error);
      return 0;
    }
  };

  // Calcular receita recebida localmente (incluindo serviços pagos e concluídos)
  const paidRevenue = events.flatMap(event => 
    event.event_services?.filter(service => 
      service.provider_id === userData?.id &&
      (service.booking_status === 'approved' || service.booking_status === 'completed')
    ).map(service => {
      // Calcular o valor que o prestador recebe (sem a taxa de 10%)
      const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
      return estimatedPrice;
    }) || []
  ).reduce((total, price) => total + price, 0);

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

  // Removida a função formatDate local - agora usa a importada de formatters.ts

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Remove segundos se houver
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
            // Verificar se TODOS os serviços do evento estão aguardando pagamento
            const allEventServicesWaitingPayment = event.event_services.every(service => 
              service.booking_status === 'waiting_payment'
            );

            if (allEventServicesWaitingPayment) {
              // Todos os serviços do evento estão aguardando pagamento
              console.log(`Todos serviços do evento ${event.id} estão aguardando pagamento, mudando status do evento para waiting_payment`);
              await updateEventStatusAction(event.id, 'waiting_payment');
            }
          }
        }
    } catch (error) {
      console.error('Erro ao verificar status dos eventos:', error);
    }
  };

  // Função para marcar serviço como concluído
  const handleMarkAsCompleted = async (serviceId: string, serviceName?: string) => {
    setActionLoading(`complete-${serviceId}`);
    
    try {
      const result = await updateEventServiceStatusAction(serviceId, 'completed');
      
      if (result.success) {
        console.log(`✅ Serviço ${serviceName || serviceId} marcado como concluído`);
        await loadData(); // Recarregar dados para atualizar a lista
      } else {
        console.error('❌ Erro ao marcar serviço como concluído:', result.error);
      }
    } catch (error) {
      console.error('💥 Erro ao marcar serviço como concluído:', error);
    } finally {
      setActionLoading(null);
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
      icon: MdAttachMoney,
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

  // Card adicional para mobile (Eventos Realizados aparece junto com os stats principais)
  const mobileOnlyCard = {
    title: 'Eventos Realizados',
    value: completedEvents.toString(),
    icon: MdTrendingUp,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    change: '',
    changeType: 'neutral'
  };

  const revenueStats = [
    {
      title: 'Receita Recebida',
      value: formatCurrency(paidRevenue),
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 text-white">
        <h2 className="text-lg sm:text-2xl font-bold mb-2 break-words">
          Bem-vindo, {userData?.organization_name || userData?.full_name}!
        </h2>
        <p className="text-purple-100 text-sm sm:text-base">
          Aqui está um resumo da sua atividade como prestador de serviços
        </p>
      </div>

      {/* Stats Cards */}
      {/* Mobile: 6 cards em grid 2 colunas | Desktop: 5 cards em uma linha */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-lg sm:text-xl ${stat.textColor}`} />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mt-1">{stat.title}</p>
            </div>
          </motion.div>
        ))}
        
        {/* Card adicional APENAS no mobile (Eventos Realizados) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: statsCards.length * 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 sm:hidden"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${mobileOnlyCard.bgColor} rounded-xl flex items-center justify-center`}>
              <MdTrendingUp className={`text-lg sm:text-xl ${mobileOnlyCard.textColor}`} />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{mobileOnlyCard.value}</p>
            <p className="text-gray-600 text-xs sm:text-sm font-medium mt-1">{mobileOnlyCard.title}</p>
          </div>
        </motion.div>
      </div>

      {/* Card de Receita Recebida APENAS no mobile (full width) */}
      <div className="sm:hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: (statsCards.length + 1) * 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${revenueStats[0].bgColor} rounded-xl flex items-center justify-center`}>
              <MdAttachMoney className={`text-lg ${revenueStats[0].textColor}`} />
            </div>
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{revenueStats[0].value}</p>
            <p className="text-gray-600 text-xs font-medium mt-1">{revenueStats[0].title}</p>
          </div>
        </motion.div>
      </div>

      {/* Revenue Stats - APENAS no desktop (Receita Recebida + Eventos Realizados lado a lado) */}
      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {revenueStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (statsCards.length * 0.1) + (index * 0.1) }}
            className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-lg sm:text-xl ${stat.textColor}`} />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-600 text-xs sm:text-sm font-medium mt-1">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FestAgenda Card */}
      <AgendaCard events={events} onViewAll={() => setActiveTab('agenda')} />

      {/* Recent Requests - Redesigned */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-white">Solicitações Recentes</h3>
          <button
            onClick={() => setActiveTab('requests')}
            className="px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm text-white text-xs sm:text-sm rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            Ver todas
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdNotifications className="text-gray-400 text-3xl sm:text-4xl" />
            </div>
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Nenhuma solicitação</h4>
            <p className="text-sm text-gray-500">Quando clientes solicitarem seus serviços, elas aparecerão aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.slice(0, 5).map((event, index) => {
              const hasPendingServices = event.event_services?.some(s => s.booking_status === 'pending_provider_approval');
              const clientName = event.client?.organization_name || event.client?.full_name || 'Cliente não identificado';
              
              return (
                <div key={event.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors duration-200">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MdEvent className="text-purple-600 text-lg sm:text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base mb-1">{event.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Contratante: <span className="font-semibold text-purple-600">{clientName}</span>
                        </p>
                      </div>
                    </div>
                    
                    {hasPendingServices && (
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 active:bg-yellow-300 text-yellow-700 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 hover:shadow-sm active:scale-95"
                      >
                        <MdPendingActions className="text-sm sm:text-base" />
                        Ação Necessária
                      </button>
                    )}
                  </div>
                  
                  {/* Event Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <MdCalendarToday className="text-purple-500 text-base flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{formatEventDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
                      <MdLocationOn className="text-purple-500 text-base flex-shrink-0" />
                      <span className="text-gray-700 truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <MdPeople className="text-purple-500 text-base flex-shrink-0" />
                      <span className="text-gray-700 font-medium">
                        {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                          ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                          : `${event.guest_count} convidados`
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Services with Status and Value */}
                  <div className="space-y-2">
                    {event.event_services?.map((service, serviceIndex) => {
                      const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                      const statusText = {
                        'pending_provider_approval': 'Aguardando Aprovação',
                        'waiting_payment': 'Aguardando Pagamento',
                        'approved': 'Aprovado',
                        'completed': 'Concluído',
                        'rejected': 'Rejeitado'
                      };
                      
                      const statusColors = {
                        'pending_provider_approval': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                        'waiting_payment': 'bg-blue-50 text-blue-700 border-blue-200',
                        'approved': 'bg-green-50 text-green-700 border-green-200',
                        'completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'rejected': 'bg-red-50 text-red-700 border-red-200'
                      };
                      
                      return (
                        <div 
                          key={serviceIndex} 
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${statusColors[service.booking_status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                            <span className="font-bold text-xs sm:text-sm truncate">
                              {service.service?.name || 'Serviço'}
                            </span>
                            <span className="hidden sm:inline text-current opacity-30">•</span>
                            <span className="text-xs sm:text-sm font-medium opacity-90">
                              {statusText[service.booking_status as keyof typeof statusText] || service.booking_status}
                            </span>
                          </div>
                          {estimatedPrice > 0 && (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-xs text-current opacity-60">Valor:</span>
                              <span className="font-bold text-sm sm:text-base">{formatCurrency(estimatedPrice)}</span>
                            </div>
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
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-4">
              {/* Contador e ações de seleção */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {selectedServices.size} de {pendingServices.length} serviços selecionados
                </span>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={selectAllPendingServices}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap"
                  >
                    Selecionar todos pendentes
                  </button>
                  <span className="text-gray-300 hidden sm:inline">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-700 font-medium whitespace-nowrap"
                  >
                    Limpar seleção
                  </button>
                </div>
              </div>
              
              {/* Botões de ação em lote */}
              {selectedServices.size > 0 && (
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={handleBulkApprove}
                    disabled={actionLoading === 'bulk-action'}
                    className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <MdCheckCircle className="text-lg sm:text-xl" />
                    {actionLoading === 'bulk-action' ? 'Processando...' : `Aprovar ${selectedServices.size}`}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={actionLoading === 'bulk-action'}
                    className="flex-1 min-h-[48px] bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <MdClose className="text-lg sm:text-xl" />
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
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header do Card - Roxo */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{event.title}</h3>
                    {event.client && (
                      <p className="text-sm text-purple-100">
                        Contratante: <span className="font-semibold text-white">
                          {event.client.organization_name || event.client.full_name || 'Não informado'}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Informações do Evento */}
                  <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2">
                        <MdCalendarToday className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Data e Hora</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {formatEventDate(event.event_date)}
                            {event.start_time && (
                              <span className="block text-purple-600">{formatTime(event.start_time)}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdLocationOn className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Local</p>
                          <p className="text-sm text-gray-900 font-semibold">{event.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdPeople className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Convidados</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                              ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                              : `${event.guest_count} convidados`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Serviços */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {eventPendingServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    const isSelected = selectedServices.has(service.id);
                    const isApproving = actionLoading === `approve-${service.id}`;
                    const isRejecting = actionLoading === `reject-${service.id}`;
                    
                    return (
                      <div key={serviceIndex} className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4 space-y-4">
                        {/* Header do Serviço */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleServiceSelection(service.id)}
                            className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                          />
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <h4 className="text-base sm:text-lg font-bold text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                                <p className="text-sm text-gray-600">Categoria: {service.service?.category || 'Não especificada'}</p>
                              </div>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(service.booking_status)} whitespace-nowrap self-start sm:self-auto`}>
                                {getStatusText(service.booking_status)}
                              </span>
                            </div>

                            {/* Valor */}
                            <div className="bg-white rounded-lg p-3 border border-yellow-300">
                              <p className="text-xs text-gray-500 font-medium mb-1">Valor a Receber</p>
                              <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(estimatedPrice)}</p>
                            </div>

                            {/* Observações */}
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Observações do Cliente:</p>
                                <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                                  Nenhuma observação fornecida
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Suas Observações:</p>
                                <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                                  Nenhuma observação adicionada
                                </p>
                              </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-yellow-300">
                              <button
                                onClick={() => handleApproveService(service.id, service.service?.name)}
                                disabled={isApproving || actionLoading === 'bulk-action'}
                                className="flex-1 min-h-[48px] px-6 py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm sm:text-base rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2"
                              >
                                {isApproving ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Aprovando...
                                  </>
                                ) : (
                                  <>
                                    <MdCheckCircle className="text-xl" />
                                    Aprovar Orçamento
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectService(service.id, service.service?.name)}
                                disabled={isApproving || isRejecting || actionLoading === 'bulk-action'}
                                className="flex-1 min-h-[48px] px-6 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm sm:text-base rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                              >
                                {isRejecting ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Rejeitando...
                                  </>
                                ) : (
                                  <>
                                    <MdClose className="text-xl" />
                                    Rejeitar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
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
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header do Card - Roxo */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{event.title}</h3>
                    {event.client && (
                      <p className="text-sm text-purple-100">
                        Contratante: <span className="font-semibold text-white">
                          {event.client.organization_name || event.client.full_name || 'Não informado'}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Informações do Evento */}
                  <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2">
                        <MdCalendarToday className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Data e Hora</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {formatEventDate(event.event_date)}
                            {event.start_time && (
                              <span className="block text-purple-600">{formatTime(event.start_time)}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdLocationOn className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Local</p>
                          <p className="text-sm text-gray-900 font-semibold">{event.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdPeople className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Convidados</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                              ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                              : `${event.guest_count} convidados`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Serviços */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {eventWaitingPaymentServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    
                    return (
                      <div key={serviceIndex} className="bg-blue-50 rounded-xl border-2 border-blue-200 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                            <p className="text-sm text-gray-600">Categoria: {service.service?.category || 'Não especificada'}</p>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(service.booking_status)} whitespace-nowrap self-start sm:self-auto`}>
                            {getStatusText(service.booking_status)}
                          </span>
                        </div>

                        {/* Valor */}
                        <div className="bg-white rounded-lg p-3 border border-blue-300">
                          <p className="text-xs text-gray-500 font-medium mb-1">Valor Estimado</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600">{formatCurrency(estimatedPrice)}</p>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg p-3 border border-blue-300">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Status do Pagamento:</p>
                          <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
                            <MdPayment className="text-lg" />
                            Aguardando pagamento do cliente
                          </p>
                        </div>
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
              Os serviços que já foram pagos e que você ainda precisa prestar aparecerão aqui.
              <br />
              Caso já tenham sido realizados, estarão na aba Concluídos!
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
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header do Card - Roxo */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{event.title}</h3>
                    {event.client && (
                      <p className="text-sm text-purple-100">
                        Contratante: <span className="font-semibold text-white">
                          {event.client.organization_name || event.client.full_name || 'Não informado'}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Informações do Evento */}
                  <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2">
                        <MdCalendarToday className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Data e Hora</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {formatEventDate(event.event_date)}
                            {event.start_time && (
                              <span className="block text-purple-600">{formatTime(event.start_time)}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdLocationOn className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Local</p>
                          <p className="text-sm text-gray-900 font-semibold">{event.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdPeople className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Convidados</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                              ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                              : `${event.guest_count} convidados`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Serviços */}
                  <div className="p-4 sm:p-5 space-y-4">
                  {eventPaidServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    
                    return (
                      <div key={serviceIndex} className="bg-green-50 rounded-xl border-2 border-green-200 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                            <p className="text-sm text-gray-600">Categoria: {service.service?.category || 'Não especificada'}</p>
                          </div>
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap self-start sm:self-auto flex items-center gap-1">
                            <MdCheckCircle className="text-sm" />
                            Pago e Confirmado
                          </span>
                        </div>

                        {/* Valor */}
                        <div className="bg-white rounded-lg p-3 border border-green-300">
                          <p className="text-xs text-gray-500 font-medium mb-1">Valor Recebido</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(estimatedPrice)}</p>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-lg p-3 border border-green-300">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Status do Serviço:</p>
                          <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                            <MdPayment className="text-lg" />
                            Pagamento confirmado - Preste o serviço no dia do evento
                          </p>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-green-300">
                          <a
                            href={`https://wa.me/5511999999999?text=Olá! Sou o prestador do serviço ${service.service?.name} para o evento ${event.title} em ${formatEventDate(event.event_date)}. Preciso de suporte administrativo.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-h-[48px] px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:bg-purple-700 transition-all duration-200 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
                          >
                            <MdWhatsapp className="text-xl" />
                            Contatar Admin
                          </a>
                          <button
                            onClick={() => handleMarkAsCompleted(service.id, service.service?.name)}
                            disabled={actionLoading === `complete-${service.id}`}
                            className="flex-1 min-h-[48px] px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                          >
                            {actionLoading === `complete-${service.id}` ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processando...
                              </>
                            ) : (
                              <>
                                <MdCheckCircle className="text-xl" />
                                Marcar como Concluído
                              </>
                            )}
                          </button>
                        </div>
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
    );
  };

  const renderCompleted = () => {
    // Filtrar apenas serviços concluídos que pertencem ao prestador logado
    const completedServices = events.flatMap(event => 
      event.event_services?.filter(service => 
        // Verificar se o serviço pertence ao prestador logado
        service.provider_id === userData?.id &&
        // Verificar se está concluído
        service.booking_status === 'completed'
      ) || []
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Eventos Concluídos</h2>
            <p className="text-gray-600 mt-1">Total de {completedServices.length} serviço(s) concluído(s)</p>
          </div>
        </div>

        {completedServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <MdCheckCircle className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum evento concluído</h3>
            <p className="text-gray-600">
              Eventos marcados como concluídos aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              // Filtrar apenas os serviços concluídos deste evento que pertencem ao prestador
              const eventCompletedServices = event.event_services?.filter(service => 
                service.provider_id === userData?.id &&
                service.booking_status === 'completed'
              ) || [];

              // Só mostrar o evento se tiver serviços concluídos do prestador
              if (eventCompletedServices.length === 0) return null;

              return (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header do Card - Roxo */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-4 sm:p-5">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{event.title}</h3>
                    {event.client && (
                      <p className="text-sm text-purple-100">
                        Contratante: <span className="font-semibold text-white">
                          {event.client.organization_name || event.client.full_name || 'Não informado'}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Informações do Evento */}
                  <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-start gap-2">
                        <MdCalendarToday className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Data e Hora</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {formatEventDate(event.event_date)}
                            {event.start_time && (
                              <span className="block text-purple-600">{formatTime(event.start_time)}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdLocationOn className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Local</p>
                          <p className="text-sm text-gray-900 font-semibold">{event.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MdPeople className="text-purple-500 text-lg flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Convidados</p>
                          <p className="text-sm text-gray-900 font-semibold">
                            {event.full_guests !== undefined && event.half_guests !== undefined && event.free_guests !== undefined
                              ? formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)
                              : `${event.guest_count} convidados`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Serviços */}
                  <div className="p-4 sm:p-5 space-y-4">
                  {eventCompletedServices.map((service, serviceIndex) => {
                    const estimatedPrice = calculateEstimatedPriceForEvent(service, event);
                    
                    return (
                      <div key={serviceIndex} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-gray-900">{service.service?.name || 'Serviço Solicitado'}</h4>
                            <p className="text-sm text-gray-600">Categoria: {service.service?.category || 'Não especificada'}</p>
                          </div>
                          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white whitespace-nowrap self-start sm:self-auto flex items-center gap-1">
                            <MdCheckCircle className="text-sm" />
                            Concluído
                          </span>
                        </div>

                        {/* Valor */}
                        <div className="bg-white rounded-lg p-3 border border-green-400">
                          <p className="text-xs text-gray-500 font-medium mb-1">Valor Recebido</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(estimatedPrice)}</p>
                        </div>

                        {/* Status - Destaque de Conclusão */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
                          <p className="text-sm font-bold flex items-center gap-2 mb-1">
                            <MdCheckCircle className="text-2xl" />
                            Serviço Concluído com Sucesso!
                          </p>
                          <p className="text-xs opacity-90">
                            Evento realizado em {formatEventDate(event.event_date)}
                            {event.start_time && ` às ${formatTime(event.start_time)}`}
                          </p>
                        </div>
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
    );
  };

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
      case 'completed':
        return renderCompleted();
      case 'agenda':
        return <FestAgenda events={events} onRefresh={loadData} />;
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
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Tabs - Fixed at top (no sticky) */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-2">
                <div className="overflow-x-auto scrollbar-hide">
                  <nav className="flex gap-2 min-w-max" role="tablist">
                    {[
                      { id: 'overview', label: 'Visão Geral', icon: MdDashboard, shortLabel: 'Visão' },
                      { id: 'requests', label: 'Solicitações', icon: MdPendingActions, shortLabel: 'Solicitações' },
                      { id: 'waiting_payment', label: 'Aguardando Pagamento', icon: MdPayment, shortLabel: 'Aguardando' },
                      { id: 'paid', label: 'Pagos', icon: MdAttachMoney, shortLabel: 'Pagos' },
                      { id: 'completed', label: 'Concluídos', icon: MdCheckCircle, shortLabel: 'Concluídos' },
                      { id: 'agenda', label: 'FestAgenda', icon: MdEvent, shortLabel: 'Agenda' },
                      { id: 'services', label: 'Meus Serviços', icon: MdBusinessCenter, shortLabel: 'Serviços' },
                      { id: 'profile', label: 'Perfil', icon: MdSettings, shortLabel: 'Perfil' }
                    ].map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          role="tab"
                          aria-selected={isActive}
                          aria-label={tab.label}
                          className={`
                            flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm whitespace-nowrap min-h-[44px]
                            outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-1
                            active:scale-95 hover:scale-[1.02]
                            ${isActive 
                              ? 'bg-purple-600 text-white shadow-md' 
                              : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                            }
                          `}
                        >
                          <tab.icon className="text-base sm:text-lg flex-shrink-0" />
                          <span className="hidden md:inline">{tab.label}</span>
                          <span className="md:hidden">{tab.shortLabel}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
            {renderContent()}
          </div>
        </div>

        {/* Modal de Confirmação */}
        {showConfirmModal && confirmAction && (
          <div className="fixed inset-0 backdrop-blur-md bg-white/20 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  confirmAction?.type === 'approve' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {confirmAction?.type === 'approve' ? (
                    <MdCheckCircle className={`text-3xl text-green-600`} />
                  ) : (
                    <MdClose className={`text-3xl text-red-600`} />
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmAction?.type === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                </h3>
                
                <p className="text-gray-600">
                  {confirmAction?.serviceIds ? (
                    `Tem certeza que deseja ${confirmAction.type === 'approve' ? 'aprovar' : 'rejeitar'} ${confirmAction.serviceIds.length} serviços?`
                  ) : (
                    `Tem certeza que deseja ${confirmAction.type === 'approve' ? 'aprovar' : 'rejeitar'} ${confirmAction.serviceName || 'este serviço'}?`
                  )}
                </p>
                
                {confirmAction?.type === 'approve' && (
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
                    confirmAction?.type === 'approve' 
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
                    confirmAction?.type === 'approve' ? 'Aprovar' : 'Rejeitar'
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