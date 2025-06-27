'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdFilterList, MdDownload } from 'react-icons/md';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusFilter } from '@/components/admin/StatusFilter';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { StatusFilterOption } from '@/types/admin';

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions: StatusFilterOption[] = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'solicitacao_enviada', label: 'Solicitação Enviada', color: '#0EA5E9' },
    { value: 'aguardando_pagamento', label: 'Aguardando Pagamento', color: '#EAB308' },
    { value: 'confirmado', label: 'Confirmado', color: '#22C55E' },
    { value: 'cancelado', label: 'Cancelado', color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-title">Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os pedidos da plataforma
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <MdDownload className="text-lg" />
            <span>Exportar</span>
          </button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-4 mb-4">
          <MdFilterList className="text-xl text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por cliente, prestador ou serviço..."
          />
          <StatusFilter
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
        </div>
      </motion.div>

      {/* Estatísticas Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">12</p>
            </div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-green-600">1,180</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">42</p>
            </div>
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Tabela de Pedidos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <OrdersTable />
      </motion.div>

      {/* Paginação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex justify-between items-center"
      >
        <p className="text-gray-600">
          Mostrando 1-10 de 1,234 pedidos
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
            Anterior
          </button>
          <button className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            3
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Próximo
          </button>
        </div>
      </motion.div>
    </div>
  );
} 