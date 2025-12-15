'use client';

import { motion } from 'framer-motion';
import {
  MdEvent,
  MdCalendarToday,
  MdAccessTime,
  MdPerson,
  MdAttachMoney,
  MdArrowForward,
  MdCheckCircle,
  MdPending,
  MdPayment
} from 'react-icons/md';
import { EventWithServices } from '@/types/database';
import { formatCurrency, formatEventDate } from '@/utils/formatters';

interface AgendaCardProps {
  events: EventWithServices[];
  onViewAll: () => void;
}

const STATUS_ICONS = {
  pending_provider_approval: MdPending,
  approved: MdCheckCircle,
  waiting_payment: MdPayment,
  paid: MdAttachMoney,
  in_progress: MdAccessTime,
  completed: MdCheckCircle,
  cancelled: MdCheckCircle
};

const STATUS_COLORS = {
  pending_provider_approval: 'text-yellow-600 bg-yellow-100',
  approved: 'text-blue-600 bg-blue-100',
  waiting_payment: 'text-orange-600 bg-orange-100',
  paid: 'text-green-600 bg-green-100',
  in_progress: 'text-purple-600 bg-purple-100',
  completed: 'text-gray-600 bg-gray-100',
  cancelled: 'text-red-600 bg-red-100'
};

export default function AgendaCard({ events, onViewAll }: AgendaCardProps) {
  // Filtrar e ordenar eventos futuros
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today && event.event_services.some(es => es.provider_id);
    })
    .sort((a, b) => {
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    })
    .slice(0, 5); // Mostrar apenas os 5 próximos

  // Calcular dias até o evento
  const getDaysUntil = (eventDate: string) => {
    const event = new Date(eventDate);
    const today = new Date();
    const diffTime = event.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (upcomingEvents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MdEvent className="text-purple-600 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MdCalendarToday className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-500 mb-4">Nenhum evento agendado</p>
          <button
            onClick={onViewAll}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Ver Agenda Completa
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
            <MdEvent className="text-purple-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Próximos Eventos</h3>
            <p className="text-sm text-gray-500">{upcomingEvents.length} evento(s) agendado(s)</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
        >
          Ver Todos
          <MdArrowForward className="text-lg" />
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {upcomingEvents.map((event, index) => {
          const daysUntil = getDaysUntil(event.event_date);
          const providerServices = event.event_services.filter(es => es.provider_id);
          const totalPrice = providerServices.reduce(
            (sum, es) => sum + (es.total_estimated_price || 0),
            0
          );

          // Pegar o primeiro serviço para mostrar o status
          const firstService = providerServices[0];
          const status = firstService?.booking_status || 'pending_provider_approval';
          const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || MdPending;
          const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending_provider_approval;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  {/* Title and Client */}
                  <div className="flex items-start gap-2 mb-2">
                    <MdEvent className="text-purple-600 text-lg flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-0.5">
                        <MdPerson className="text-gray-400" />
                        <span className="truncate">{event.client?.full_name || 'Cliente'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <MdCalendarToday className="text-gray-400" />
                      <span>{formatEventDate(event.event_date)}</span>
                    </div>
                    {event.start_time && (
                      <div className="flex items-center gap-1">
                        <MdAccessTime className="text-gray-400" />
                        <span>{event.start_time}</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Status */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <MdAttachMoney className="text-green-600" />
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusColor}`}>
                      <StatusIcon className="text-sm" />
                      <span className="hidden sm:inline">
                        {status === 'pending_provider_approval' && 'Pendente'}
                        {status === 'approved' && 'Aprovado'}
                        {status === 'waiting_payment' && 'Aguardando Pagto'}
                        {status === 'paid' && 'Pago'}
                        {status === 'in_progress' && 'Em Andamento'}
                        {status === 'completed' && 'Concluído'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Days Until Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`px-3 py-2 rounded-lg text-center ${
                      daysUntil === 0
                        ? 'bg-red-100 border-2 border-red-300'
                        : daysUntil <= 7
                        ? 'bg-orange-100 border-2 border-orange-300'
                        : 'bg-blue-100 border border-blue-300'
                    }`}
                  >
                    <div
                      className={`text-xl font-bold ${
                        daysUntil === 0
                          ? 'text-red-600'
                          : daysUntil <= 7
                          ? 'text-orange-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {daysUntil === 0 ? 'HOJE' : daysUntil}
                    </div>
                    {daysUntil > 0 && (
                      <div className="text-xs text-gray-600">
                        {daysUntil === 1 ? 'dia' : 'dias'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Preview */}
              {providerServices.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {providerServices.slice(0, 2).map((es, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full"
                      >
                        {es.service?.name || 'Serviço'}
                      </span>
                    ))}
                    {providerServices.length > 2 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        +{providerServices.length - 2} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onViewAll}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <MdCalendarToday className="text-lg" />
          Ver Agenda Completa
        </button>
      </div>
    </motion.div>
  );
}
