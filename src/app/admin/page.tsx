'use client';

import { motion } from 'framer-motion';
import { 
  MdCelebration, 
  MdPending, 
  MdAttachMoney, 
  MdPeople,
  MdRefresh,
  MdDateRange
} from 'react-icons/md';
import { StatCard } from '@/components/admin/StatCard';
import { ActivePartiesTracker } from '@/components/admin/ActivePartiesTracker';

export default function AdminDashboard() {
  const stats = [
    {
      title: 'Festas Ativas',
      value: '24',
      icon: MdCelebration,
      trend: '+12%'
    },
    {
      title: 'Pedidos Pendentes',
      value: '12',
      icon: MdPending,
      trend: '+5%'
    },
    {
      title: 'Faturamento Mensal',
      value: 'R$ 45.000',
      icon: MdAttachMoney,
      trend: '+8%'
    },
    {
      title: 'Novos Clientes',
      value: '156',
      icon: MdPeople,
      trend: '+15%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-title">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Visão geral da plataforma Be Fest
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MdDateRange className="text-lg" />
            <span>Últimos 30 dias</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            <MdRefresh className="text-lg" />
            <span>Atualizar</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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

      {/* Gráficos Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-title mb-4">
            Pedidos por Mês
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de pedidos será implementado aqui</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-title mb-4">
            Faturamento
          </h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de faturamento será implementado aqui</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 