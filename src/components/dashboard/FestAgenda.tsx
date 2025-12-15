'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdCalendarMonth,
  MdViewWeek,
  MdEvent,
  MdPerson,
  MdAttachMoney,
  MdPeople,
  MdAccessTime,
  MdLocationOn,
  MdCheckCircle,
  MdPending,
  MdPayment,
  MdCancel
} from 'react-icons/md';
import { EventWithServices } from '@/types/database';
import { formatCurrency, formatEventDate } from '@/utils/formatters';
import EventDetailsModal from './EventDetailsModal';

interface FestAgendaProps {
  events: EventWithServices[];
  onRefresh?: () => void;
}

type ViewMode = 'week' | 'month' | 'year';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  status: string;
  clientName: string;
  services: string[];
  guestCount: number;
  totalPrice: number;
  fullData: EventWithServices;
}

const STATUS_COLORS = {
  pending_provider_approval: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  approved: 'bg-blue-100 border-blue-300 text-blue-800',
  waiting_payment: 'bg-orange-100 border-orange-300 text-orange-800',
  paid: 'bg-green-100 border-green-300 text-green-800',
  in_progress: 'bg-purple-100 border-purple-300 text-purple-800',
  completed: 'bg-gray-100 border-gray-300 text-gray-800',
  cancelled: 'bg-red-100 border-red-300 text-red-800'
};

const STATUS_LABELS = {
  pending_provider_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  waiting_payment: 'Aguardando Pagamento',
  paid: 'Pago',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado'
};

export default function FestAgenda({ events, onRefresh }: FestAgendaProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventWithServices | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Converter eventos para formato do calendário
  const calendarEvents = useMemo((): CalendarEvent[] => {
    return events.flatMap(event => {
      // Para cada evento, criar uma entrada para cada serviço contratado
      return event.event_services
        .filter(es => es.provider_id) // Apenas serviços do prestador atual
        .map(eventService => ({
          id: eventService.id,
          title: event.title,
          date: new Date(event.event_date),
          startTime: event.start_time || '18:00',
          status: eventService.booking_status,
          clientName: event.client?.full_name || 'Cliente',
          services: [eventService.service?.name || 'Serviço'],
          guestCount: event.guest_count || 0,
          totalPrice: eventService.total_estimated_price || 0,
          fullData: event
        }));
    });
  }, [events]);

  // Navegação de data
  const goToToday = () => setCurrentDate(new Date());

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  // Obter dias da semana atual
  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek); // Ajustar para domingo

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Obter dias do mês atual
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Adicionar dias do mês anterior para preencher a primeira semana
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - i - 1);
      days.push(day);
    }

    // Adicionar todos os dias do mês
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Adicionar dias do próximo mês para completar a última semana
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }

    return days;
  };

  // Obter meses do ano
  const getYearMonths = (date: Date) => {
    const year = date.getFullYear();
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  };

  // Obter eventos de um dia específico
  const getEventsForDay = (date: Date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Renderizar visualização semanal
  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const today = new Date();

    return (
      <div className="grid grid-cols-7 gap-2">
        {/* Cabeçalho dos dias */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
          <div key={day} className="text-center py-2 font-semibold text-gray-700 text-sm">
            {day}
          </div>
        ))}

        {/* Dias da semana */}
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();

          return (
            <motion.div
              key={index}
              className={`min-h-[120px] p-2 border rounded-lg ${
                isToday ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`text-center mb-2 ${isToday ? 'text-purple-600 font-bold' : 'text-gray-600'}`}>
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <motion.button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event.fullData);
                      setShowEventModal(true);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs border ${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 border-gray-300'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="text-[10px] opacity-75">{event.startTime}</div>
                  </motion.button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Renderizar visualização mensal
  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);
    const today = new Date();
    const currentMonth = currentDate.getMonth();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Cabeçalho dos dias */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center py-2 font-semibold text-gray-700 text-xs">
            {day}
          </div>
        ))}

        {/* Dias do mês */}
        {monthDays.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();
          const isCurrentMonth = day.getMonth() === currentMonth;

          return (
            <motion.div
              key={index}
              className={`min-h-[80px] p-1 border rounded ${
                isToday
                  ? 'bg-purple-50 border-purple-300'
                  : isCurrentMonth
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-100'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
            >
              <div
                className={`text-center text-xs mb-1 ${
                  isToday
                    ? 'text-purple-600 font-bold'
                    : isCurrentMonth
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map(event => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event.fullData);
                      setShowEventModal(true);
                    }}
                    className={`w-full text-left px-1 py-0.5 rounded text-[10px] border ${STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || 'bg-gray-100'}`}
                  >
                    <div className="truncate">{event.title}</div>
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-gray-500 text-center">
                    +{dayEvents.length - 2}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Renderizar visualização anual
  const renderYearView = () => {
    const months = getYearMonths(currentDate);
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
      <div className="grid grid-cols-3 gap-4">
        {months.map((month, index) => {
          const monthEvents = calendarEvents.filter(event => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getMonth() === month.getMonth() &&
              eventDate.getFullYear() === month.getFullYear()
            );
          });

          return (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentDate(month);
                setViewMode('month');
              }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="font-semibold text-gray-800 mb-2">{monthNames[index]}</div>
              <div className="text-2xl font-bold text-purple-600">{monthEvents.length}</div>
              <div className="text-xs text-gray-500">
                {monthEvents.length === 1 ? 'evento' : 'eventos'}
              </div>
            </motion.button>
          );
        })}
      </div>
    );
  };

  const getHeaderTitle = () => {
    if (viewMode === 'week') {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} de ${start.toLocaleDateString('pt-BR', { month: 'short' })} - ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
    } else if (viewMode === 'month') {
      return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } else {
      return currentDate.getFullYear().toString();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <MdEvent className="text-3xl" />
          <h2 className="text-2xl font-bold">FestAgenda</h2>
        </div>
        <p className="text-purple-100">Gerencie seus eventos e compromissos</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* View Mode Toggles */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdViewWeek className="inline mr-1" />
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdCalendarMonth className="inline mr-1" />
              Mês
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'year'
                  ? 'bg-white text-purple-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MdToday className="inline mr-1" />
              Ano
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MdChevronLeft className="text-xl" />
            </button>

            <button
              onClick={goToToday}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Hoje
            </button>

            <button
              onClick={goToNext}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MdChevronRight className="text-xl" />
            </button>
          </div>

          {/* Current Period */}
          <div className="text-lg font-semibold text-gray-800 capitalize">
            {getHeaderTitle()}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'year' && renderYearView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
