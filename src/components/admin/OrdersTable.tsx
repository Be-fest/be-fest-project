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
    <div className="overflow-x-auto">
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
  );
} 