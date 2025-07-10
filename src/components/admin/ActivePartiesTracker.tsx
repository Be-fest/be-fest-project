'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from './StatusBadge';
import { getAdminEventsAction, AdminEvent } from '@/lib/actions/admin';
import { OrderStatus } from '@/types/admin';
import { MdError, MdRefresh } from 'react-icons/md';

export function ActivePartiesTracker() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAdminEventsAction();
      
      if (result.success && result.data) {
        // Filtrar apenas eventos ativos e pegar os primeiros 5
        const activeEvents = result.data
          .filter(event => event.status !== 'cancelled' && event.status !== 'draft')
          .slice(0, 5);
        setEvents(activeEvents);
      } else {
        setError(result.error || 'Erro ao carregar eventos');
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos ativos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getProgressSteps = () => [
    'Contratação',
    'Pagamento', 
    'Confirmação',
    'Em Andamento',
    'Concluído'
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-green-600';
    if (progress >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-primary to-primary-dark';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'published': return 'Publicado';
      case 'waiting_payment': return 'Aguardando Pagamento';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string): OrderStatus => {
    switch (status) {
      case 'completed': return 'confirmado';
      case 'waiting_payment': return 'aguardando_pagamento';
      case 'published': return 'confirmado';
      case 'cancelled': return 'cancelado';
      default: return 'solicitacao_enviada';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-title">
          Festas em Andamento
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">
            {events.length} festas ativas
          </span>
          <button
            onClick={loadEvents}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <MdRefresh className={`text-sm ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Carregando festas...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <MdError className="text-red-500 text-4xl mx-auto mb-2" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadEvents}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma festa ativa encontrada</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">{event.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{event.client_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Data: {formatDate(event.event_date)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Local: {event.location}
                  </p>
                  <p className="text-xs text-gray-400">
                    Convidados: {event.guest_count}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {event.progress}% completo
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {event.services_count} serviços
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    {formatCurrency(event.total_estimated_value)}
                  </div>
                </div>
              </div>
              
              {/* Barra de Progresso */}
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${event.progress}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${getProgressColor(event.progress)}`}
                  />
                </div>
                
                {/* Etapas */}
                <div className="hidden sm:flex justify-between text-xs text-gray-500">
                  {getProgressSteps().map((step, stepIndex) => (
                    <span
                      key={step}
                      className={`${
                        stepIndex < (event.progress / 20) ? 'text-primary font-medium' : ''
                      }`}
                    >
                      {step}
                    </span>
                  ))}
                </div>
                
                {/* Etapas Mobile - Layout simplificado */}
                <div className="sm:hidden grid grid-cols-2 gap-1 text-xs text-gray-500">
                  {getProgressSteps().map((step, stepIndex) => (
                    <span
                      key={step}
                      className={`text-center ${
                        stepIndex < (event.progress / 20) ? 'text-primary font-medium' : ''
                      }`}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status e Informações */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">Status:</span>
                  <StatusBadge status={getStatusColor(event.status)} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
} 