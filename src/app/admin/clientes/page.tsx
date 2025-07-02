'use client';

import { motion } from 'framer-motion';
import { MdPeople, MdEmail, MdPhone, MdCalendarToday } from 'react-icons/md';
import { Client } from '@/types/admin';

// Mock data para demonstração
const mockClients: Client[] = [
  {
    id: 'CLI-001',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    createdAt: new Date('2024-01-15'),
    totalOrders: 5,
    totalSpent: 15000
  },
  {
    id: 'CLI-002',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    createdAt: new Date('2024-01-10'),
    totalOrders: 3,
    totalSpent: 8500
  },
  {
    id: 'CLI-003',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    phone: '(11) 77777-7777',
    cpf: '456.789.123-00',
    createdAt: new Date('2024-01-05'),
    totalOrders: 8,
    totalSpent: 25000
  }
];

export default function AdminClients() {
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-title">Clientes</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie todos os clientes da plataforma
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Total de Clientes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{mockClients.length}</p>
            </div>
            <div className="bg-primary-light p-2 sm:p-3 rounded-lg">
              <MdPeople className="text-lg sm:text-2xl text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Pedidos Totais</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                {mockClients.reduce((acc, client) => acc + client.totalOrders, 0)}
              </p>
            </div>
            <div className="bg-primary-light p-2 sm:p-3 rounded-lg">
              <MdCalendarToday className="text-lg sm:text-2xl text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Faturamento Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(mockClients.reduce((acc, client) => acc + client.totalSpent, 0))}
              </p>
            </div>
            <div className="bg-primary-light p-2 sm:p-3 rounded-lg">
              <MdEmail className="text-lg sm:text-2xl text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {mockClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-lg">
                    {client.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{client.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">ID: {client.id}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <MdEmail className="text-base sm:text-lg flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <MdPhone className="text-base sm:text-lg flex-shrink-0" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <MdCalendarToday className="text-base sm:text-lg flex-shrink-0" />
                <span>Desde {formatDate(client.createdAt)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{client.totalOrders}</p>
                  <p className="text-xs text-gray-500">Pedidos</p>
                </div>
                <div>
                  <p className="text-sm sm:text-lg font-semibold text-primary">
                    {formatCurrency(client.totalSpent)}
                  </p>
                  <p className="text-xs text-gray-500">Gasto Total</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 