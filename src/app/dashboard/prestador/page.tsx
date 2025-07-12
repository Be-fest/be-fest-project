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
  MdAdd,
  MdSettings,
  MdVisibility,
  MdArrowUpward,
  MdArrowDownward
} from 'react-icons/md';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { ServiceManagement } from '@/components/dashboard/ServiceManagement';
import { ProviderProfile } from '@/components/dashboard/ProviderProfile';
import { AuthGuard } from '@/components/AuthGuard';
import { getProviderEventsAction } from '@/lib/actions/events';
import { getProviderServicesAction, getProviderStatsAction } from '@/lib/actions/services';
import { EventWithServices, Service } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';

export default function ProviderDashboard() {
  const { userData } = useAuth();
  const [events, setEvents] = useState<EventWithServices[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerStats, setProviderStats] = useState({
    totalEvents: 0,
    activeServices: 0,
    averageRating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'services' | 'profile'>('overview');

  useEffect(() => {
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
        }

        if (servicesResult.success && servicesResult.data) {
          setServices(servicesResult.data);
        } else if (servicesResult.error) {
          console.error('Erro ao carregar serviços:', servicesResult.error);
        }

        if (statsResult.success && statsResult.data) {
          setProviderStats(statsResult.data);
        } else if (statsResult.error) {
          console.error('Erro ao carregar estatísticas:', statsResult.error);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Estatísticas baseadas nos dados reais
  const totalRequests = events.length;
  const pendingRequests = events.filter(event => 
    event.event_services?.some(service => service.booking_status === 'pending_provider_approval')
  ).length;
  const approvedRequests = events.filter(event => 
    event.event_services?.some(service => service.booking_status === 'approved')
  ).length;
  const rejectedRequests = events.filter(event => 
    event.event_services?.some(service => service.booking_status === 'rejected')
  ).length;

  const totalRevenue = events.reduce((sum, event) => {
    return sum + (event.event_services?.reduce((eventSum, service) => {
      return eventSum + (service.total_estimated_price || 0);
    }, 0) || 0);
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_payment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_provider_approval':
        return 'Aguardando Aprovação';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'pending_payment':
        return 'Aguardando Pagamento';
      default:
        return status;
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
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Pendentes',
      value: pendingRequests,
      icon: MdPendingActions,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      change: '+3%',
      changeType: 'increase'
    },
    {
      title: 'Aprovadas',
      value: approvedRequests,
      icon: MdCheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Serviços Ativos',
      value: providerStats.activeServices,
      icon: MdBusinessCenter,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '0%',
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
      change: totalRevenue > 0 ? '+' + Math.round((totalRevenue / 10000) * 100) / 100 + '%' : '0%',
      changeType: totalRevenue > 0 ? 'increase' : 'neutral'
    },
    {
      title: 'Eventos Realizados',
      value: providerStats.totalEvents.toString(),
      icon: MdTrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: providerStats.totalEvents > 0 ? '+' + providerStats.totalEvents : '0',
      changeType: providerStats.totalEvents > 0 ? 'increase' : 'neutral'
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
            {events.slice(0, 5).map((event, index) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
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
                        {event.guest_count} convidados
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.event_services?.map((service, serviceIndex) => (
                    <span
                      key={serviceIndex}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.booking_status)}`}
                    >
                      {getStatusText(service.booking_status)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Solicitações de Serviços</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Total: {totalRequests}</span>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <MdNotifications className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
          <p className="text-gray-600">
            Quando clientes solicitarem seus serviços, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
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
                      {event.guest_count} convidados
                    </span>
                  </div>
                </div>
              </div>

              {event.event_services?.map((service, serviceIndex) => (
                <div key={serviceIndex} className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Serviço Solicitado</h4>
                      <p className="text-sm text-gray-600">
                        Preço estimado: {formatCurrency(service.total_estimated_price || 0)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(service.booking_status)}`}>
                      {getStatusText(service.booking_status)}
                    </span>
                  </div>
                  
                  {service.client_notes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Observações do Cliente:</p>
                      <p className="text-sm text-gray-600">{service.client_notes}</p>
                    </div>
                  )}
                  
                  {service.provider_notes && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Suas Observações:</p>
                      <p className="text-sm text-gray-600">{service.provider_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
      </ProviderLayout>
    </AuthGuard>
  );
} 