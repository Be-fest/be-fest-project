'use client';

import { motion } from 'framer-motion';
import { MdTrendingUp, MdEvent, MdStar, MdAttachMoney } from 'react-icons/md';

interface ProviderStatsProps {
  onQuickAction?: (action: string) => void;
}

export function ProviderStats({ onQuickAction }: ProviderStatsProps) {
  const stats = [
    {
      title: 'Eventos este mês',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: MdEvent,
      color: 'bg-blue-500'
    },
    {
      title: 'Receita total',
      value: 'R$ 18.420',
      change: '+8%',
      changeType: 'positive',
      icon: MdAttachMoney,
      color: 'bg-green-500'
    },
    {
      title: 'Avaliação média',
      value: '4.8',
      change: '+0.2',
      changeType: 'positive',
      icon: MdStar,
      color: 'bg-yellow-500'
    },
    {
      title: 'Taxa de conversão',
      value: '68%',
      change: '+5%',
      changeType: 'positive',
      icon: MdTrendingUp,
      color: 'bg-purple-500'
    }
  ];

  const recentOrders = [
    {
      id: 1,
      client: 'Maria Silva',
      event: 'Aniversário 15 anos',
      date: '2024-02-15',
      value: 'R$ 2.400',
      status: 'confirmed'
    },
    {
      id: 2,
      client: 'João Santos',
      event: 'Casamento',
      date: '2024-02-20',
      value: 'R$ 5.200',
      status: 'pending'
    },
    {
      id: 3,
      client: 'Ana Costa',
      event: 'Festa Corporativa',
      date: '2024-02-25',
      value: 'R$ 3.800',
      status: 'confirmed'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#520029] mb-2">
          Bem-vindo de volta, Barreto's Buffet! 👋
        </h1>
        <p className="text-gray-600">
          Aqui está um resumo do seu desempenho nos últimos 30 dias.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="text-white text-xl" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#520029] mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-[#520029] mb-4">Pedidos Recentes</h2>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-[#520029]">{order.client}</h4>
                  <p className="text-sm text-gray-600">{order.event}</p>
                  <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#A502CA]">{order.value}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-[#520029] mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button
              className="w-full bg-[#A502CA] hover:bg-[#8B0A9E] text-white py-3 px-4 rounded-lg font-medium transition-colors text-left"
              onClick={() => onQuickAction && onQuickAction('addService')}
            >
              Adicionar Novo Serviço
            </button>
            <button
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 px-4 rounded-lg font-medium transition-colors text-left"
              onClick={() => onQuickAction && onQuickAction('viewOrders')}
            >
              Ver Solicitações Pendentes
            </button>
            <button
              className="w-full bg-green-50 hover:bg-green-100 text-green-600 py-3 px-4 rounded-lg font-medium transition-colors text-left"
              onClick={() => onQuickAction && onQuickAction('updateProfile')}
            >
              Atualizar Perfil
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
