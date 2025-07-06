'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MdAdd,
  MdSearch,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdFilterList,
  MdClose,
  MdMoreVert,
  MdArrowBack,
  MdAttachMoney,
  MdEvent,
} from 'react-icons/md';
import { motion } from 'framer-motion';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction, deleteEventAction } from '@/lib/actions/events';
import { Event, EventStatus } from '@/types/database';
import { ClientLayout } from '@/components/client/ClientLayout';
import { AuthGuard } from '@/components/AuthGuard';

// Skeleton Components
const PartiesSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-300 rounded"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>
      <div className="h-12 w-40 bg-gray-300 rounded-lg"></div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Parties Grid Skeleton */}
    <div className="grid gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-300"></div>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-300 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function MinhasFestasPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  // Carregar eventos do cliente
  const loadEvents = async () => {
    setLoading(true);
    const result = await getClientEventsAction();
    if (result.success && result.data) {
      setEvents(result.data);
    } else {
      console.error('Erro ao carregar eventos:', result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    loadEvents(); // Recarregar lista
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (confirm(`Tem certeza que deseja excluir a festa "${eventTitle}"?`)) {
      const result = await deleteEventAction(eventId);
      if (result.success) {
        setEvents(events.filter(e => e.id !== eventId));
      } else {
        alert(result.error || 'Erro ao excluir evento');
      }
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'planning':
        return 'Planejamento';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Realizada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="p-6">
          <PartiesSkeleton />
        </div>
      </ClientLayout>
    );
  }

  return (
    <AuthGuard requiredRole="client">
      <ClientLayout>
      <div className="p-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-[#520029] hover:text-[#A502CA] transition-colors mb-6 font-medium"
        >
          <MdArrowBack className="mr-2 text-xl" />
          Voltar para Home
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#520029] mb-2">
              Minhas Festas
            </h1>
            <p className="text-gray-600">
              Gerencie e acompanhe todas as suas festas em um só lugar
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNewPartyModalOpen(true)}
            className="bg-[#F71875] hover:bg-[#E6006F] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-colors"
          >
            <MdAdd className="text-xl" />
            Nova Festa
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MdEvent className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{events.length}</p>
                <p className="text-gray-600 text-sm">Total de Festas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MdCalendarToday className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {events.filter(e => e.status === 'confirmed').length}
                </p>
                <p className="text-gray-600 text-sm">Confirmadas</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <MdPeople className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {events.filter(e => e.status === 'planning').length}
                </p>
                <p className="text-gray-600 text-sm">Em Planejamento</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Buscar festas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <MdFilterList className="text-gray-500 text-xl" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
              >
                <option value="all">Todas</option>
                <option value="draft">Rascunho</option>
                <option value="planning">Planejamento</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-r from-[#F71875] to-[#A502CA] relative">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-2xl font-bold">{event.title}</h2>
                  <p className="text-pink-100">{formatDate(event.event_date)}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdLocationOn className="text-lg" />
                    <span>{event.location || 'Local não definido'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdPeople className="text-lg" />
                    <span>{event.guest_count} convidados</span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                                      <div className="text-sm text-gray-500">
                      0 serviços contratados
                    </div>
                  <Link
                    href={`/minhas-festas/${event.id}`}
                    className="bg-[#F71875] hover:bg-[#E6006F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdEvent className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              Nenhuma festa criada ainda
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Que tal começar a planejar sua primeira festa? É fácil e rápido!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNewPartyModalOpen(true)}
              className="bg-[#F71875] hover:bg-[#E6006F] text-white px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <MdAdd className="text-xl" />
              Criar Primeira Festa
            </motion.button>
          </motion.div>
        )}

        {/* New Party Modal */}
        <NewPartyModal
          isOpen={isNewPartyModalOpen}
          onClose={() => setNewPartyModalOpen(false)}
          onSuccess={handleCreatePartySuccess}
        />
      </div>
    </ClientLayout>
    </AuthGuard>
  );
} 