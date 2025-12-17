'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdCelebration, 
  MdPending, 
  MdAttachMoney, 
  MdPeople,
  MdRefresh,
  MdDateRange,
  MdError,
  MdPayment,
  MdCheckCircle,
  MdAccountBalance
} from 'react-icons/md';
import { StatCard } from '@/components/admin/StatCard';
import { getAdminStatsAction } from '@/lib/actions/admin';
import { AdminStats } from '@/lib/actions/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalActiveEvents: 0,
    totalPendingRequests: 0,
    monthlyRevenue: 0,
    newClients: 0,
    totalProviders: 0,
    totalClients: 0,
    totalServices: 0,
    totalEvents: 0,
    totalEventServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageEventValue: 0,
    eventsByStatus: {
      draft: 0,
      published: 0,
      waiting_payment: 0,
      completed: 0,
      cancelled: 0
    },
    eventServicesByStatus: {
      pending_provider_approval: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    },
    recentActivity: {
      newEvents: 0,
      newServices: 0,
      newProviders: 0,
      newClients: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAdminStatsAction();
      
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        setError(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas do dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Calcular serviços aguardando pagamento (eventos com status waiting_payment)
  const servicesAwaitingPayment = stats.eventsByStatus.waiting_payment;
  
  // Calcular serviços pagos (eventos com status completed)
  const servicesPaid = stats.eventsByStatus.completed;
  
  // Calcular renda estimada em taxas (assumindo 10% de taxa sobre serviços aprovados)
  const estimatedFeeRevenue = stats.totalRevenue * 0.1;

  const statsCards = [
    {
      title: 'Serviços Aguardando Pagamento',
      value: servicesAwaitingPayment.toString(),
      icon: MdPayment,
      color: 'text-yellow-600'
    },
    {
      title: 'Serviços Pagos',
      value: servicesPaid.toString(),
      icon: MdCheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Renda Estimada',
      value: formatCurrency(stats.totalRevenue),
      icon: MdAttachMoney,
      color: 'text-blue-600'
    },
    {
      title: 'Renda em Taxas',
      value: formatCurrency(estimatedFeeRevenue),
      icon: MdAccountBalance,
      color: 'text-purple-600'
    }
  ];

  const additionalStatsCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients.toString(),
      icon: MdPeople,
      color: 'text-blue-600'
    },
    {
      title: 'Total de Prestadores',
      value: stats.totalProviders.toString(),
      icon: MdCelebration,
      color: 'text-purple-600'
    },
    {
      title: 'Total de Eventos',
      value: stats.totalEvents.toString(),
      icon: MdDateRange,
      color: 'text-green-600'
    },
    {
      title: 'Total de Serviços',
      value: stats.totalEventServices.toString(),
      icon: MdPending,
      color: 'text-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MdError className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-title">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Visão geral da plataforma Be Fest
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
            <MdDateRange className="text-base sm:text-lg" />
            <span>Últimos 30 dias</span>
          </button>
          <button 
            onClick={loadStats}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base disabled:opacity-50"
          >
            <MdRefresh className={`text-base sm:text-lg ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Stats Cards Adicionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {additionalStatsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`bg-gray-100 p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="text-2xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Eventos por Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base sm:text-lg font-semibold text-title mb-4">
            Eventos por Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rascunhos</span>
              <span className="font-bold text-gray-500">{stats.eventsByStatus.draft}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Publicados</span>
              <span className="font-bold text-blue-600">{stats.eventsByStatus.published}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aguardando Pagamento</span>
              <span className="font-bold text-yellow-600">{stats.eventsByStatus.waiting_payment}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Concluídos</span>
              <span className="font-bold text-green-600">{stats.eventsByStatus.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelados</span>
              <span className="font-bold text-red-600">{stats.eventsByStatus.cancelled}</span>
            </div>
          </div>
        </motion.div>

        {/* Serviços por Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base sm:text-lg font-semibold text-title mb-4">
            Serviços por Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendentes de Aprovação</span>
              <span className="font-bold text-yellow-600">{stats.eventServicesByStatus.pending_provider_approval}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aprovados</span>
              <span className="font-bold text-green-600">{stats.eventServicesByStatus.approved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejeitados</span>
              <span className="font-bold text-red-600">{stats.eventServicesByStatus.rejected}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelados</span>
              <span className="font-bold text-gray-500">{stats.eventServicesByStatus.cancelled}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Taxa de Aprovação</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.totalEventServices > 0 
                    ? Math.round((stats.eventServicesByStatus.approved / stats.totalEventServices) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Atividade Recente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base sm:text-lg font-semibold text-title mb-4">
            Atividade Recente (7 dias)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Novos Eventos</span>
              <span className="font-bold text-blue-600">{stats.recentActivity.newEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Novos Serviços</span>
              <span className="font-bold text-purple-600">{stats.recentActivity.newServices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Novos Prestadores</span>
              <span className="font-bold text-green-600">{stats.recentActivity.newProviders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Novos Clientes</span>
              <span className="font-bold text-orange-600">{stats.recentActivity.newClients}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Valor Médio por Evento</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(stats.averageEventValue)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Faturamento e Resumo Geral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Faturamento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base sm:text-lg font-semibold text-title mb-4">
            Faturamento
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Receita Mensal</span>
              <span className="font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Receita Total</span>
              <span className="font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Renda em Taxas (10%)</span>
              <span className="font-bold text-purple-600">{formatCurrency(estimatedFeeRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Média por Evento</span>
              <span className="font-bold text-gray-900">{formatCurrency(stats.averageEventValue)}</span>
            </div>
          </div>
        </motion.div>

        {/* Resumo Geral */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base sm:text-lg font-semibold text-title mb-4">
            Resumo Geral
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Eventos</span>
              <span className="font-bold text-gray-900">{stats.totalEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Clientes</span>
              <span className="font-bold text-gray-900">{stats.totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Prestadores</span>
              <span className="font-bold text-gray-900">{stats.totalProviders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Serviços Ativos</span>
              <span className="font-bold text-gray-900">{stats.totalServices}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Taxa de Conversão</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.totalClients > 0 
                    ? Math.round((stats.totalActiveEvents / stats.totalClients) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 