'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdCelebration, 
  MdPending, 
  MdAttachMoney, 
  MdPeople,
  MdRefresh,
  MdDateRange,
  MdError
} from 'react-icons/md';
import { StatCard } from '@/components/admin/StatCard';
import { ActivePartiesTracker } from '@/components/admin/ActivePartiesTracker';
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

  const statsCards = [
    {
      title: 'Festas Ativas',
      value: stats.totalActiveEvents.toString(),
      icon: MdCelebration,
      trend: '+12%'
    },
    {
      title: 'Pedidos Pendentes',
      value: stats.totalPendingRequests.toString(),
      icon: MdPending,
      trend: '+5%'
    },
    {
      title: 'Faturamento Mensal',
      value: formatCurrency(stats.monthlyRevenue),
      icon: MdAttachMoney,
      trend: '+8%'
    },
    {
      title: 'Novos Clientes',
      value: stats.newClients.toString(),
      icon: MdPeople,
      trend: '+15%'
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Festas em Andamento */}
      <ActivePartiesTracker />

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
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
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
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
              <span className="text-gray-600">Média por Evento</span>
              <span className="font-bold text-gray-900">
                {stats.totalActiveEvents > 0 
                  ? formatCurrency(stats.monthlyRevenue / stats.totalActiveEvents)
                  : 'R$ 0,00'
                }
              </span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((stats.monthlyRevenue / 100000) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Meta mensal: {formatCurrency(100000)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-base sm:text-lg font-semibold text-title mb-4">
            Atividade Recente
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Novos Clientes (30d)</span>
              <span className="font-bold text-blue-600">{stats.newClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pedidos Pendentes</span>
              <span className="font-bold text-yellow-600">{stats.totalPendingRequests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Eventos Ativos</span>
              <span className="font-bold text-green-600">{stats.totalActiveEvents}</span>
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