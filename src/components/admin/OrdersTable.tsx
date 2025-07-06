'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { StatusBadge } from './StatusBadge';
import { getBookingsAction } from '@/lib/actions/bookings';
import { BookingWithDetails, BookingStatus } from '@/types/database';

export function OrdersTable() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar bookings
  const loadBookings = async () => {
    setLoading(true);
    const result = await getBookingsAction();
    if (result.success && result.data) {
      setBookings(result.data);
    } else {
      console.error('Erro ao carregar bookings:', result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'solicitacao_enviada';
      case 'confirmed':
        return 'confirmado';
      case 'paid':
        return 'aguardando_pagamento';
      case 'completed':
        return 'concluido';
      case 'cancelled':
        return 'cancelado';
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
            {bookings.map((booking, index) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6 font-mono text-sm text-gray-600">
                  {booking.id.slice(0, 8)}...
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">{booking.event.title}</div>
                    <div className="text-sm text-gray-500">{booking.event.location || 'Local não informado'}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.service.provider.organization_name || booking.service.provider.full_name}
                    </div>
                    <div className="text-sm text-gray-500">{booking.service.provider.area_of_operation}</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-900">
                  <div>
                    <div className="font-medium">{booking.service.name}</div>
                    <div className="text-sm text-gray-500">{booking.service.category}</div>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">
                  {formatCurrency(booking.price)}
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {booking.guest_count}
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={getStatusLabel(booking.status)} />
                </td>
                <td className="py-4 px-6 text-gray-600">
                  {formatDate(booking.event.event_date)}
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
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">
                  {booking.id.slice(0, 8)}...
                </span>
                <StatusBadge status={getStatusLabel(booking.status)} size="sm" />
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

            {/* Evento e Prestador */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Evento</p>
                <p className="font-medium text-gray-900">{booking.event.title}</p>
                <p className="text-sm text-gray-500">{booking.event.location || 'Local não informado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Prestador</p>
                <p className="font-medium text-gray-900">
                  {booking.service.provider.organization_name || booking.service.provider.full_name}
                </p>
              </div>
            </div>

            {/* Serviço e Detalhes */}
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Serviço</p>
                <p className="text-gray-900">{booking.service.name}</p>
                <p className="text-sm text-gray-500">{booking.service.category}</p>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Valor</p>
                  <p className="font-semibold text-primary">{formatCurrency(booking.price)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Convidados</p>
                  <p className="text-sm text-gray-900">{booking.guest_count}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Data do Evento</p>
                  <p className="text-sm text-gray-900">{formatDate(booking.event.event_date)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {bookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-gray-600">
            As reservas aparecerão aqui quando os clientes finalizarem seus pedidos
          </p>
        </div>
      )}
    </>
  );
} 