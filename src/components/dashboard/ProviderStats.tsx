'use client';

import { motion } from 'framer-motion';
import { MdTrendingUp, MdEvent, MdStar, MdAttachMoney, MdAdd, MdNotifications } from 'react-icons/md';

interface ProviderStatsProps {
  onQuickAction?: (action: string) => void;
}

export function ProviderStats({ onQuickAction }: ProviderStatsProps) {
  const stats = [
    {
      title: 'Eventos este mês',
      value: '0',
      change: '',
      changeType: 'neutral',
      icon: MdEvent,
      color: 'bg-blue-500'
    },
    {
      title: 'Receita total',
      value: 'R$ 0,00',
      change: '',
      changeType: 'neutral',
      icon: MdAttachMoney,
      color: 'bg-green-500'
    },
    {
      title: 'Avaliação média',
      value: '-',
      change: '',
      changeType: 'neutral',
      icon: MdStar,
      color: 'bg-yellow-500'
    },
    {
      title: 'Taxa de conversão',
      value: '-',
      change: '',
      changeType: 'neutral',
      icon: MdTrendingUp,
      color: 'bg-purple-500'
    }
  ];

  const recentOrders: any[] = [];

  const quickActions = [
    {
      id: 'addService',
      title: 'Novo Serviço',
      description: 'Adicione um novo serviço ao seu catálogo',
      icon: MdAdd,
      color: 'bg-[#A502CA] hover:bg-[#8B0A9E]',
      textColor: 'text-white'
    },
    {
      id: 'viewOrders',
      title: 'Solicitações',
      description: 'Veja pedidos pendentes de aprovação',
      icon: MdNotifications,
      color: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
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
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum pedido recente encontrado</p>
                <p className="text-sm text-gray-400 mt-1">Os pedidos aparecerão aqui assim que você começar a receber solicitações</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions - Redesenhado */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-[#520029] mb-4">Ações Rápidas</h2>
          <div className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onQuickAction && onQuickAction(action.id)}
                  className={`w-full ${action.color} ${action.textColor} p-4 rounded-lg font-medium transition-all text-left flex items-center gap-3 shadow-sm hover:shadow-md`}
                >
                  <div className="flex-shrink-0">
                    <Icon className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
