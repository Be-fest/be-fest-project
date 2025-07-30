'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdFilterList, MdDownload, MdRefresh } from 'react-icons/md';
import { SearchInput } from '@/components/admin/SearchInput';
import { StatusFilter } from '@/components/admin/StatusFilter';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { StatusFilterOption } from '@/types/admin';
import { getAllEventServicesAction } from '@/lib/actions/admin';

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });

  const statusOptions: StatusFilterOption[] = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'pending_provider_approval', label: 'Pendente de Aprovação', color: '#0EA5E9' },
    { value: 'approved', label: 'Aprovado', color: '#22C55E' },
    { value: 'rejected', label: 'Rejeitado', color: '#EF4444' },
    { value: 'cancelled', label: 'Cancelado', color: '#6B7280' }
  ];

  // Carregar estatísticas dos event_services
  const loadStats = async () => {
    try {
      setLoading(true);
      const result = await getAllEventServicesAction();
      if (result.success && result.data) {
        const eventServices = result.data;
        const stats = {
          total: eventServices.length,
          pending: eventServices.filter(es => es.booking_status === 'pending_provider_approval').length,
          approved: eventServices.filter(es => es.booking_status === 'approved').length,
          rejected: eventServices.filter(es => es.booking_status === 'rejected').length,
          cancelled: eventServices.filter(es => es.booking_status === 'cancelled').length
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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
            Gerencie todos os pedidos de serviços da plataforma
          </p>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button 
            onClick={loadStats}
            disabled={loading}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50"
          >
            <MdRefresh className={`text-base sm:text-lg ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
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
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Total de Pedidos</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Pendentes</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Aprovados</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Rejeitados</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="w-2 h-2 bg-red-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-600">Cancelados</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-600">{stats.cancelled}</p>
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full self-end sm:self-auto mt-2 sm:mt-0"></div>
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
        <OrdersTable 
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </motion.div>

      {/* Paginação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left">
          {searchTerm || statusFilter !== 'todos' 
            ? `Mostrando resultados filtrados` 
            : `Mostrando todos os ${stats.total} pedidos`
          }
        </p>
      </motion.div>
    </div>
  );
} 