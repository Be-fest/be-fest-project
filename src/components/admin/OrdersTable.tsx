'use client';

import { motion } from 'framer-motion';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { Order } from '@/types/admin';
import { StatusBadge } from './StatusBadge';

// Mock data para demonstração
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    clientId: 'CLI-001',
    clientName: 'João Silva',
    providerId: 'PRO-001',
    providerName: 'Barreto\'s Buffet',
    serviceName: 'Buffet Completo',
    value: 3500,
    status: 'confirmado',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    partyDate: new Date('2024-02-15')
  },
  {
    id: 'ORD-002',
    clientId: 'CLI-002',
    clientName: 'Maria Santos',
    providerId: 'PRO-002',
    providerName: 'DJ Mix',
    serviceName: 'Som e Iluminação',
    value: 1200,
    status: 'aguardando_pagamento',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    partyDate: new Date('2024-02-20')
  },
  {
    id: 'ORD-003',
    clientId: 'CLI-003',
    clientName: 'Pedro Costa',
    providerId: 'PRO-003',
    providerName: 'Flores & Cia',
    serviceName: 'Decoração Premium',
    value: 2500,
    status: 'solicitacao_enviada',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    partyDate: new Date('2024-02-25')
  }
];

export function OrdersTable() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary-light">
              <th className="text-left py-4 px-6 font-medium text-white">ID</th>
              <th className="text-left py-4 px-6 font-medium text-white">Cliente</th>
              <th className="text-left py-4 px-6 font-medium text-white">Prestador</th>
              <th className="text-left py-4 px-6 font-medium text-white">Serviço</th>
              <th className="text-left py-4 px-6 font-medium text-white">Valor</th>
              <th className="text-left py-4 px-6 font-medium text-white">Status</th>
              <th className="text-left py-4 px-6 font-medium text-white">Data da Festa</th>
              <th className="text-left py-4 px-6 font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 font-mono text-sm text-gray-600">
                  {order.id}
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{order.clientName}</div>
                    <div className="text-sm text-gray-500">ID: {order.clientId}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{order.providerName}</div>
                    <div className="text-sm text-gray-500">ID: {order.providerId}</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900">
                  {order.serviceName}
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">
                  {formatCurrency(order.value)}
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={order.status} />
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {order.partyDate ? formatDate(order.partyDate) : '-'}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors">
                      <MdVisibility className="text-lg" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <MdEdit className="text-lg" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {mockOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">{order.id}</span>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-gray-600 hover:text-primary hover:bg-primary-light rounded-lg transition-colors">
                  <MdVisibility className="text-lg" />
                </button>
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <MdEdit className="text-lg" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <MdDelete className="text-lg" />
                </button>
              </div>
            </div>

            {/* Cliente e Prestador */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                <p className="font-medium text-gray-900">{order.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Prestador</p>
                <p className="font-medium text-gray-900">{order.providerName}</p>
              </div>
            </div>

            {/* Serviço e Detalhes */}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Serviço</p>
                <p className="text-gray-900">{order.serviceName}</p>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Valor</p>
                  <p className="font-semibold text-primary">{formatCurrency(order.value)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Data da Festa</p>
                  <p className="text-sm text-gray-900">
                    {order.partyDate ? formatDate(order.partyDate) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
} 