'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdEvent,
  MdCalendarToday,
  MdRefresh,
  MdError,
  MdPeople,
  MdCheckCircle,
  MdPending,
  MdPayment
} from 'react-icons/md';
import { startOfWeek, format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAgendaEventsByWeekAction, AgendaEvent } from '@/lib/actions/agenda';
import { WeekNavigator } from '@/components/admin/WeekNavigator';
import { EventCard } from '@/components/admin/EventCard';
import { ChatModal } from '@/components/admin/ChatModal';
import { createClient } from '@/lib/supabase/client';

export default function FestAgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    return startOfWeek(new Date(), { weekStartsOn: 0 });
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Chat modal state
  const [selectedEventServiceId, setSelectedEventServiceId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getUser();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
      const result = await getAgendaEventsByWeekAction(weekStartStr);

      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        setError(result.error || 'Erro ao carregar eventos');
      }
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar lista de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentWeekStart]);

  const handleWeekChange = (weekStart: Date) => {
    setCurrentWeekStart(weekStart);
  };

  const handleEventClick = (event: AgendaEvent) => {
    // Could open a detail modal or navigate to event details
    console.log('Event clicked:', event);
  };

  const handleChatClick = (eventServiceId: string) => {
    setSelectedEventServiceId(eventServiceId);
    setIsChatOpen(true);
  };

  const closeChatModal = () => {
    setIsChatOpen(false);
    setSelectedEventServiceId(null);
  };

  // Group events by day of the week
  const eventsByDay = events.reduce((groups, event) => {
    const eventDate = new Date(event.event_date);
    const dayKey = format(eventDate, 'yyyy-MM-dd');
    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(event);
    return groups;
  }, {} as Record<string, AgendaEvent[]>);

  // Generate all days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      key: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEEE', { locale: ptBR }),
      dayNumber: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    };
  });

  // Stats
  const stats = {
    totalEvents: events.length,
    pendingEvents: events.filter(e => e.booking_status === 'pending_provider_approval').length,
    approvedEvents: events.filter(e => ['approved', 'waiting_payment', 'in_progress'].includes(e.booking_status)).length,
    totalGuests: events.reduce((sum, e) => sum + e.guest_count, 0)
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MdError className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar eventos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadEvents}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MdEvent className="text-purple-600" />
            Agenda
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Visualize e gerencie eventos por semana
          </p>
        </div>
        <button
          onClick={loadEvents}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50"
        >
          <MdRefresh className={`text-base sm:text-lg ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Eventos na Semana</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <MdCalendarToday className="text-2xl text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingEvents}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <MdPending className="text-2xl text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approvedEvents}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <MdCheckCircle className="text-2xl text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Convidados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalGuests}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <MdPeople className="text-2xl text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Week Navigator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <WeekNavigator
          currentWeekStart={currentWeekStart}
          onWeekChange={handleWeekChange}
        />
      </motion.div>

      {/* Weekly Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="space-y-4"
      >
        {weekDays.map((day, index) => {
          const dayEvents = eventsByDay[day.key] || [];

          return (
            <div key={day.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Day header */}
              <div className={`px-4 py-3 border-b ${day.isToday ? 'bg-purple-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${day.isToday
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    {day.dayNumber}
                  </div>
                  <div>
                    <h3 className={`font-semibold capitalize ${day.isToday ? 'text-purple-600' : 'text-gray-900'}`}>
                      {day.dayName}
                      {day.isToday && <span className="ml-2 text-sm font-normal">(Hoje)</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {dayEvents.length === 0
                        ? 'Nenhum evento'
                        : `${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Day events */}
              {dayEvents.length > 0 && (
                <div className="p-4 space-y-3">
                  {dayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                      onChatClick={() => handleChatClick(event.event_service_id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Chat Modal */}
      {currentUserId && selectedEventServiceId && (
        <ChatModal
          eventServiceId={selectedEventServiceId}
          currentUserId={currentUserId}
          isOpen={isChatOpen}
          onClose={closeChatModal}
        />
      )}
    </div>
  );
}
