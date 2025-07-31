'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { StatusBadge } from './StatusBadge';
import { getAllEventServicesAction } from '@/lib/actions/admin';
import { OrderStatus } from '@/types/admin';

interface EventService {
  id: string;
  event_id: string;
  service_id: string;
  provider_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_status: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string;
  service_name: string;
  service_category: string;
  service_description: string;
  provider_name: string;
  provider_email: string;
  provider_whatsapp: string;
  provider_organization: string;
  booking_status: string;
  price_per_guest_at_booking: number;
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

  const getStatusLabel = (status: string): OrderStatus => {
    switch (status) {
      // Event service statuses
      case 'pending_provider_approval':
        return 'solicitacao_enviada';
      case 'approved':
        return 'confirmado';
      case 'rejected':
        return 'cancelado';
      case 'cancelled':
        return 'cancelado';
      // Event statuses
      case 'draft':
        return 'solicitacao_enviada';
      case 'published':
        return 'solicitacao_enviada';
      case 'waiting_payment':
        return 'aguardando_pagamento';
      case 'completed':
        return 'concluido';
      default:
        return 'solicitacao_enviada';
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
      {filteredEventServices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-primary-light">
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Evento</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Cliente</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Prestador</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Serviço</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Valor</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Convidados</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Status</th>
                <th className="text-left py-3 px-3 md:py-4 md:px-6 font-medium text-white text-xs md:text-sm">Data</th>
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
                  <td className="py-3 px-3 md:py-4 md:px-6">
                    <div>
                      <div className="font-medium text-gray-900 text-xs md:text-sm">{es.event_title}</div>
                      <div className="text-xs text-gray-500 hidden md:block">{es.event_location || 'Local não informado'}</div>
                      <div className="text-xs text-gray-400 hidden lg:block">ID: {es.event_id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6">
                    <div>
                      <div className="font-medium text-gray-900 text-xs md:text-sm">{es.client_name}</div>
                      <div className="text-xs text-gray-500 hidden md:block">{es.client_email}</div>
                      <div className="text-xs text-gray-400 hidden lg:block">{es.client_whatsapp}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6">
                    <div>
                      <div className="font-medium text-gray-900 text-xs md:text-sm">{es.provider_name}</div>
                      <div className="text-xs text-gray-500 hidden md:block">{es.provider_email}</div>
                      <div className="text-xs text-gray-400 hidden lg:block">{es.provider_whatsapp}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-900">
                    <div>
                      <div className="font-medium text-xs md:text-sm">{es.service_name}</div>
                      <div className="text-xs text-gray-500 hidden md:block">{es.service_category}</div>
                      <div className="text-xs text-gray-400 hidden lg:block">ID: {es.service_id.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 font-medium text-gray-900">
                    <div>
                      <div className="text-xs md:text-sm">{formatCurrency(es.total_estimated_price)}</div>
                      <div className="text-xs text-gray-500 hidden md:block">
                        {formatCurrency(es.price_per_guest_at_booking)}/convidado
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-600 text-xs md:text-sm">
                    {es.guest_count}
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6">
                    <StatusBadge status={getStatusLabel(es.booking_status)} size="sm" />
                  </td>
                  <td className="py-3 px-3 md:py-4 md:px-6 text-gray-600 text-xs md:text-sm">
                    {formatDate(es.event_date)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-600">
            Os pedidos aparecerão aqui quando os clientes solicitarem serviços
          </p>
        </div>
      ) : null}
    </>
  );
} 