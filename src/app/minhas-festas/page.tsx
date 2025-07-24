'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MdAdd,
  MdSearch,
  MdEvent,
  MdCheckCircle,
  MdHistory,
  MdTrendingUp,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdPendingActions,
  MdError,
  MdAttachMoney,
  MdSettings,
  MdPerson,
  MdArrowForward,
  MdFilterList,
  MdWorkOutline,
  MdListAlt,
  MdDelete,
  MdInfo,
  MdEdit,
  MdWarning,
  MdPayment,
  MdCancel,
  MdWhatsapp,
  MdClose,
  MdRefresh
} from 'react-icons/md';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction } from '@/lib/actions/event-services';
import { Event, EventStatus, EventServiceWithDetails } from '@/types/database';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/hooks/useToast';

export default function MinhasFestasPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventServices, setEventServices] = useState<{[key: string]: EventServiceWithDetails[]}>({});
  const [loading, setLoading] = useState(true);
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'waiting_payment' | 'completed' | 'cancelled' | 'null'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [serviceToCancel, setServiceToCancel] = useState<{eventId: string, serviceName: string} | null>(null);
  const { toast } = useToast();

  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getClientEventsAction();
      if (result.success && result.data) {
        setEvents(result.data);
        
        // Carregar serviços para cada evento
        const servicesData: {[key: string]: EventServiceWithDetails[]} = {};
        for (const event of result.data) {
          const servicesResult = await getEventServicesAction({ event_id: event.id });
          if (servicesResult.success && servicesResult.data) {
            servicesData[event.id] = servicesResult.data;
          }
        }
        setEventServices(servicesData);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast.error('Erro ao carregar eventos', 'Não foi possível carregar suas festas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'null' && event.status === null) ||
      (statusFilter !== 'null' && event.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    loadEvents();
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const result = await deleteEventAction(eventToDelete.id);
      if (result.success) {
        setDeleteModalOpen(false);
        setEventToDelete(null);
        await loadEvents();
        toast.success('Festa excluída com sucesso!', 'A festa foi removida permanentemente.');
      } else {
        toast.error('Erro ao excluir festa', result.error || 'Ocorreu um erro inesperado.');
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir festa', 'Ocorreu um erro inesperado.');
    }
  };

  const handleCancelService = (eventId: string, serviceName: string) => {
    setServiceToCancel({ eventId, serviceName });
    setCancelModalOpen(true);
  };

  const handleWhatsAppCancel = () => {
    const message = `Olá! Gostaria de cancelar o serviço "${serviceToCancel?.serviceName}" da minha festa. Estou entrando em contato com mais de 48h de antecedência conforme solicitado.`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setCancelModalOpen(false);
    setServiceToCancel(null);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case null:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return <MdEdit className="text-gray-600" />;
      case 'published':
        return <MdCheckCircle className="text-green-600" />;
      case 'waiting_payment':
        return <MdPayment className="text-yellow-600" />;
      case 'completed':
        return <MdCheckCircle className="text-blue-600" />;
      case 'cancelled':
        return <MdCancel className="text-red-600" />;
      case null:
        return <MdInfo className="text-gray-600" />;
      default:
        return <MdInfo className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'published':
        return 'Publicada';
      case 'waiting_payment':
        return 'Aguardando Pagamento';
      case 'completed':
        return 'Realizada';
      case 'cancelled':
        return 'Cancelada';
      case null:
        return 'Sem Status';
      default:
        return status || 'Sem Status';
    }
  };

  const getNextAction = (event: Event) => {
    const services = eventServices[event.id] || [];
    const hasServices = services.length > 0;
    const allServicesApproved = hasServices && services.every(s => s.booking_status === 'confirmed');
    const hasRejectedServices = services.some(s => s.booking_status === 'rejected');
    const hasPendingServices = services.some(s => s.booking_status === 'pending_provider_approval');

    if (event.status === 'draft' && !hasServices) {
      return 'Adicionar serviços';
    }
    if (event.status === 'draft' && hasServices) {
      return 'Publicar festa';
    }
    if (event.status === 'published' && hasPendingServices) {
      return 'Aguardar aprovação';
    }
    if (event.status === 'published' && hasRejectedServices) {
      return 'Procurar outros serviços';
    }
    if (event.status === 'published' && allServicesApproved) {
      return 'Aguardar pagamento';
    }
    if (event.status === 'waiting_payment') {
      return 'Fazer pagamento';
    }
    if (event.status === 'completed') {
      return 'Festa realizada';
    }
    return 'Ver detalhes';
  };

  const getNextActionColor = (event: Event) => {
    const nextAction = getNextAction(event);
    switch (nextAction) {
      case 'Adicionar serviços':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'Publicar festa':
        return 'bg-green-500 hover:bg-green-600';
      case 'Fazer pagamento':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Procurar outros serviços':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'Aguardar aprovação':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-[#F71875] hover:bg-[#E6006F]';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = [
    {
      title: 'Total de Eventos',
      value: events.length,
      icon: MdEvent,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Publicadas',
      value: events.filter(e => e.status === 'published').length,
      icon: MdCheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Aguardando Pagamento',
      value: events.filter(e => e.status === 'waiting_payment').length,
      icon: MdPayment,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Realizadas',
      value: events.filter(e => e.status === 'completed').length,
      icon: MdTrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="min-h-screen bg-[#FFF6FB] p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="h-8 w-64 bg-gray-300 rounded-lg animate-pulse"></div>
                  <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ClientLayout>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB] p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-[#520029]">Minhas Festas</h1>
                  <p className="text-gray-600 text-lg">
                    Gerencie e acompanhe todas as suas festas em um só lugar
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setNewPartyModalOpen(true)}
                  className="bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#9400B8] text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all duration-200"
                >
                  <MdAdd className="text-xl" />
                  Nova Festa
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                        <stat.icon className={`text-xl ${stat.textColor}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Search and Filter */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      placeholder="Buscar por nome, descrição ou local..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent outline-none transition-all duration-200"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <MdFilterList className="text-gray-500 text-xl" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent outline-none transition-all duration-200 min-w-[140px]"
                    >
                      <option value="all">Todas</option>
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicada</option>
                      <option value="waiting_payment">Aguardando Pagamento</option>
                      <option value="completed">Realizada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="null">Sem Status</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Events Grid */}
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
                    >
                      <div className="h-48 bg-gradient-to-r from-[#F71875] to-[#A502CA] relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                          <div className="flex items-center gap-2 text-pink-100">
                            <MdCalendarToday className="text-lg" />
                            <span className="font-medium">{formatDate(event.event_date)}</span>
                          </div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)}
                            {getStatusLabel(event.status)}
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-3 text-gray-600">
                            <MdLocationOn className="text-lg text-gray-400" />
                            <span className="font-medium">{event.location || 'Local não definido'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <MdPeople className="text-lg text-gray-400" />
                            <span className="font-medium">{event.guest_count} convidados</span>
                          </div>
                        </div>

                        {event.description && (
                          <p className="text-gray-600 mb-6 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MdWorkOutline className="text-lg" />
                            <span>{(eventServices[event.id] || []).length} serviços</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/minhas-festas/${event.id}`}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                              <MdListAlt className="text-lg" />
                              Ver Detalhes
                            </Link>
                            <button
                              className={`${getNextActionColor(event)} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
                            >
                              {getNextAction(event) === 'Fazer pagamento' && <MdPayment className="text-lg" />}
                              {getNextAction(event) === 'Adicionar serviços' && <MdAdd className="text-lg" />}
                              {getNextAction(event) === 'Procurar outros serviços' && <MdSearch className="text-lg" />}
                              {getNextAction(event)}
                            </button>
                            {(event.status === 'draft' || event.status === 'cancelled' || event.status === null) && (
                              <button
                                onClick={() => handleDeleteEvent(event)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              >
                                <MdDelete className="text-lg" />
                                Excluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MdEvent className="text-white text-4xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {searchTerm || statusFilter !== 'all' ? 'Nenhuma festa encontrada' : 'Nenhuma festa criada ainda'}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tente ajustar os filtros para encontrar suas festas.' 
                      : 'Que tal começar a planejar sua primeira festa? É fácil e rápido!'
                    }
                  </p>
                  {!(searchTerm || statusFilter !== 'all') && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setNewPartyModalOpen(true)}
                      className="bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#9400B8] text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-3 shadow-lg shadow-pink-500/25 transition-all duration-200"
                    >
                      <MdAdd className="text-xl" />
                      Criar Primeira Festa
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* New Party Modal */}
          <NewPartyModal
            isOpen={isNewPartyModalOpen}
            onClose={() => setNewPartyModalOpen(false)}
            onSuccess={handleCreatePartySuccess}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteModalOpen}
            title="Excluir Festa"
            message="Tem certeza que deseja excluir esta festa? Esta ação não pode ser desfeita."
            confirmLabel="Excluir"
            cancelLabel="Cancelar"
            confirmVariant="danger"
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteModalOpen(false)}
          />

          {/* Cancel Service Modal */}
          <AnimatePresence>
            {cancelModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
                >
                  <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <MdWarning className="text-2xl" />
                        <h2 className="text-xl font-bold">Cancelar Serviço</h2>
                      </div>
                      <button
                        onClick={() => setCancelModalOpen(false)}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                      >
                        <MdClose className="text-xl" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-gray-700 mb-4">
                        Para cancelar o serviço <strong>"{serviceToCancel?.serviceName}"</strong>, entre em contato com nosso suporte via WhatsApp.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-700 mb-2">
                          <MdWarning className="text-lg" />
                          <span className="font-medium">Importante:</span>
                        </div>
                        <p className="text-yellow-700 text-sm">
                          O cancelamento deve ser feito com pelo menos 48 horas de antecedência da data do evento.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCancelModalOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleWhatsAppCancel}
                        className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <MdWhatsapp className="text-lg" />
                        Abrir WhatsApp
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
} 