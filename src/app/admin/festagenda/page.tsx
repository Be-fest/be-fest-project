'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MdEvent,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdRefresh,
  MdError,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch
} from 'react-icons/md';

interface FestEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
}

export default function FestAgendaPage() {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<FestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Implementar chamada à API para carregar eventos
      // Por enquanto, usando dados mock
      const mockEvents: FestEvent[] = [
        {
          id: '1',
          title: 'Festival de Verão 2025',
          date: '2025-01-15',
          location: 'São Paulo, SP',
          attendees: 150,
          status: 'upcoming',
          description: 'Grande festival de música e entretenimento'
        },
        {
          id: '2',
          title: 'Aniversário Corporativo',
          date: '2025-02-20',
          location: 'Rio de Janeiro, RJ',
          attendees: 80,
          status: 'upcoming',
          description: 'Celebração dos 10 anos da empresa'
        }
      ];

      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar lista de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: FestEvent['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: FestEvent['status']) => {
    switch (status) {
      case 'upcoming':
        return 'Próximo';
      case 'ongoing':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    ongoingEvents: events.filter(e => e.status === 'ongoing').length,
    totalAttendees: events.reduce((sum, e) => sum + e.attendees, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MdError className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar eventos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadEvents}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-title flex items-center gap-2">
            <MdEvent className="text-purple-600" />
            FestAgenda
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie todos os eventos da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50"
          >
            <MdRefresh className={`text-base sm:text-lg ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-sm"
          >
            <MdAdd className="text-base sm:text-lg" />
            <span>Novo Evento</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total de Eventos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <MdEvent className="text-2xl text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Próximos Eventos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingEvents}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <MdCalendarToday className="text-2xl text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Em Andamento</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.ongoingEvents}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <MdEvent className="text-2xl text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total de Participantes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAttendees}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <MdPeople className="text-2xl text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
      >
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Buscar eventos por título ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
        </div>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-title">
            Lista de Eventos ({filteredEvents.length})
          </h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <MdEvent className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum evento encontrado para sua busca' : 'Nenhum evento cadastrado'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MdCalendarToday className="text-gray-400" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MdLocationOn className="text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MdPeople className="text-gray-400" />
                        <span>{event.attendees} participantes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar evento"
                    >
                      <MdEdit className="text-xl" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deletar evento"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
