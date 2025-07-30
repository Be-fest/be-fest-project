'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { StatusBadge } from './StatusBadge';
import { getAllEventServicesAction } from '@/lib/actions/admin';

interface EventService {
  id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  client_name: string;
  client_email: string;
  service_name: string;
  service_category: string;
  provider_name: string;
  provider_email: string;
  booking_status: string;
  total_estimated_price: number;
  guest_count: number;
  created_at: string;
  updated_at: string;
}

interface OrdersTableProps {
  searchTerm?: string;
  statusFilter?: string;
}

export function OrdersTable({ searchTerm = '', statusFilter = 'todos' }: OrdersTableProps) {
  const [eventServices, setEventServices] = useState<EventService[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar event_services
  const loadEventServices = async () => {
    setLoading(true);
    const result = await getAllEventServicesAction();
    if (result.success && result.data) {
      setEventServices(result.data);
    } else {
      console.error('Erro ao carregar event services:', result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEventServices();
  }, []);

  // Filtrar event_services baseado nos filtros
  const filteredEventServices = eventServices.filter(es => {
    // Filtro por status
    if (statusFilter !== 'todos' && es.booking_status !== statusFilter) {
      return false;
    }

    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        es.event_title.toLowerCase().includes(searchLower) ||
        es.client_name.toLowerCase().includes(searchLower) ||
        es.client_email.toLowerCase().includes(searchLower) ||
        es.provider_name.toLowerCase().includes(searchLower) ||
        es.provider_email.toLowerCase().includes(searchLower) ||
        es.service_name.toLowerCase().includes(searchLower) ||
        es.service_category.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_provider_approval':
        return 'pending_provider_approval';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'cancelled':
        return 'cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary-light">
              <th className="text-left py-4 px-6 font-medium text-white">ID</th>
              <th className="text-left py-4 px-6 font-medium text-white">Evento</th>
              <th className="text-left py-4 px-6 font-medium text-white">Cliente</th>
              <th className="text-left py-4 px-6 font-medium text-white">Prestador</th>
              <th className="text-left py-4 px-6 font-medium text-white">Serviço</th>
              <th className="text-left py-4 px-6 font-medium text-white">Valor</th>
              <th className="text-left py-4 px-6 font-medium text-white">Convidados</th>
              <th className="text-left py-4 px-6 font-medium text-white">Status</th>
              <th className="text-left py-4 px-6 font-medium text-white">Data do Evento</th>
              <th className="text-left py-4 px-6 font-medium text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredEventServices.map((es, index) => (
              <motion.tr
                key={es.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 font-mono text-sm text-gray-600">
                  {es.id.slice(0, 8)}...
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{es.event_title}</div>
                    <div className="text-sm text-gray-500">{es.event_location || 'Local não informado'}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{es.client_name}</div>
                    <div className="text-sm text-gray-500">{es.client_email}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{es.provider_name}</div>
                    <div className="text-sm text-gray-500">{es.provider_email}</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900">
                  <div>
                    <div className="font-medium">{es.service_name}</div>
                    <div className="text-sm text-gray-500">{es.service_category}</div>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">
                  {formatCurrency(es.total_estimated_price)}
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {es.guest_count}
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={getStatusLabel(es.booking_status)} />
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {formatDate(es.event_date)}
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
        {filteredEventServices.map((es, index) => (
          <motion.div
            key={es.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">
                  {es.id.slice(0, 8)}...
                </span>
                <StatusBadge status={getStatusLabel(es.booking_status)} size="sm" />
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

            {/* Evento e Cliente */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Evento</p>
                <p className="font-medium text-gray-900">{es.event_title}</p>
                <p className="text-sm text-gray-500">{es.event_location || 'Local não informado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cliente</p>
                <p className="font-medium text-gray-900">{es.client_name}</p>
                <p className="text-sm text-gray-500">{es.client_email}</p>
              </div>
            </div>

            {/* Prestador e Serviço */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Prestador</p>
                <p className="font-medium text-gray-900">{es.provider_name}</p>
                <p className="text-sm text-gray-500">{es.provider_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Serviço</p>
                <p className="text-gray-900">{es.service_name}</p>
                <p className="text-sm text-gray-500">{es.service_category}</p>
              </div>
            </div>

            {/* Detalhes */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Valor</p>
                <p className="font-semibold text-primary">{formatCurrency(es.total_estimated_price)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Convidados</p>
                <p className="text-sm text-gray-900">{es.guest_count}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Data do Evento</p>
                <p className="text-sm text-gray-900">{formatDate(es.event_date)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEventServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600">
            Os pedidos aparecerão aqui quando os clientes solicitarem serviços
          </p>
        </div>
      )}
    </>
  );
} 