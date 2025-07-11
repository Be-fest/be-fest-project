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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-title">Pedidos</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie todos os pedidos da plataforma
          </p>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
            <MdDownload className="text-base sm:text-lg" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2 sm:gap-4 mb-4">
          <MdFilterList className="text-lg sm:text-xl text-gray-600" />
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Filtros</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por cliente, prestador ou serviço..."
            />
          </div>
          <div className="w-full sm:w-auto">
            <StatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </div>
        </div>
      </motion.div>

      {/* Estatísticas Rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
      >
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Pendentes</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">12</p>
            </div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Confirmados</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">1,180</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Cancelados</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">42</p>
            </div>
            <div className="w-2 h-2 bg-red-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
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
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
          Mostrando 1-10 de 1,234 pedidos
        </p>
        <div className="flex gap-1 sm:gap-2 justify-center">
          <button className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base" disabled>
            Anterior
          </button>
          <button className="px-2 sm:px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base">
            1
          </button>
          <button className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
            2
          </button>
          <button className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
            3
          </button>
          <button className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
            Próximo
          </button>
        </div>
      </motion.div>
    </div>
  );
} 