'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdEdit,
  MdDelete,
  MdAdd,
  MdShoppingCart,
  MdCheck,
  MdClose,
  MdWarning,
  MdAttachMoney,
  MdEvent,
  MdPerson,
  MdPersonOutline,
  MdFace,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getEventByIdAction, updateEventStatusAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction, createEventServiceAction, updateEventServiceStatusAction, deleteEventServiceAction } from '@/lib/actions/event-services';
import { createBookingAction } from '@/lib/actions/bookings';
import { getServicesAction } from '@/lib/actions/services';
import { Event, EventWithServices, EventServiceWithDetails, Service } from '@/types/database';
import { ClientLayout } from '@/components/client/ClientLayout';
import { AuthGuard } from '@/components/AuthGuard';

export default function PartyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  
  const [event, setEvent] = useState<EventWithServices | null>(null);
  const [eventServices, setEventServices] = useState<EventServiceWithDetails[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [clientNotes, setClientNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do evento
  const loadEventData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar evento
      const eventResult = await getEventByIdAction(eventId);
      if (!eventResult.success || !eventResult.data) {
        setError('Evento não encontrado');
        return;
      }
      setEvent(eventResult.data);

      // Carregar serviços do evento
      const servicesResult = await getEventServicesAction({ event_id: eventId });
      if (servicesResult.success && servicesResult.data) {
        setEventServices(servicesResult.data);
      }

      // Carregar serviços disponíveis
      const availableResult = await getServicesAction();
      if (availableResult.success && availableResult.data) {
        setAvailableServices(availableResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do evento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    loadEventData(); // Recarregar dados
  };

  const handleDelete = async () => {
    const result = await deleteEventAction(eventId);
    if (result.success) {
      router.push('/minhas-festas');
    } else {
      alert(result.error || 'Erro ao excluir evento');
    }
  };

  const handleAddService = async () => {
    if (!selectedService) return;

    const formData = new FormData();
    formData.append('event_id', eventId);
    formData.append('service_id', selectedService);
    formData.append('client_notes', clientNotes);

    const result = await createEventServiceAction(formData);
    if (result.success) {
      setAddServiceModalOpen(false);
      setSelectedService('');
      setClientNotes('');
      loadEventData(); // Recarregar dados
    } else {
      alert(result.error || 'Erro ao adicionar serviço');
    }
  };

  const handleRemoveService = async (eventServiceId: string) => {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      const result = await deleteEventServiceAction(eventServiceId);
      if (result.success) {
        loadEventData(); // Recarregar dados
      } else {
        alert(result.error || 'Erro ao remover serviço');
      }
    }
  };

  const handleConfirmEvent = async () => {
    const result = await updateEventStatusAction(eventId, 'confirmed');
    if (result.success) {
      loadEventData(); // Recarregar dados
    } else {
      alert(result.error || 'Erro ao confirmar evento');
    }
  };

  const handleCreateBooking = async () => {
    // Criar bookings para todos os serviços aprovados
    const approvedServices = eventServices.filter(es => es.booking_status === 'approved');
    
    for (const eventService of approvedServices) {
      const formData = new FormData();
      formData.append('event_id', eventId);
      formData.append('service_id', eventService.service_id);
      formData.append('price', (eventService.total_estimated_price || 0).toString());
      formData.append('guest_count', (event?.guest_count || 0).toString());
      
      const result = await createBookingAction(formData);
      if (!result.success) {
        alert(`Erro ao criar booking para ${eventService.service?.name}: ${result.error}`);
        return;
      }
    }
    
    alert('Bookings criados com sucesso!');
    loadEventData(); // Recarregar dados
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_provider_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Confirmado';
      case 'pending_provider_approval':
        return 'Pendente';
      case 'rejected':
        return 'Recusado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalPrice = () => {
    return eventServices
      .filter(es => es.booking_status === 'approved')
      .reduce((total, es) => total + (es.total_estimated_price || 0), 0);
  };

  const allServicesConfirmed = eventServices.length > 0 && 
    eventServices.every(es => es.booking_status === 'approved');

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#F71875] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando festa...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error || !event) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
          <div className="text-center">
            <MdWarning className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#520029] mb-4">
              {error || 'Festa não encontrada'}
            </h2>
            <Link
              href="/minhas-festas"
              className="text-[#A502CA] hover:underline flex items-center justify-center gap-2"
            >
              <MdArrowBack />
              Voltar para lista de festas
            </Link>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <AuthGuard requiredRole="client">
      <ClientLayout>
        <div className="min-h-screen bg-[#FFF6FB]">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/minhas-festas"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdArrowBack className="text-2xl text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[#520029]">{event.title}</h1>
                  <p className="text-gray-600">
                    {new Date(event.event_date).toLocaleDateString('pt-BR')} 
                    {event.start_time && ` às ${event.start_time}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-4 py-2 text-[#A502CA] border-2 border-[#A502CA] rounded-lg hover:bg-[#A502CA] hover:text-white transition-colors flex items-center gap-2"
                >
                  <MdEdit />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2"
                >
                  <MdDelete />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Informações da Festa */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-[#520029] mb-4">Detalhes da Festa</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MdCalendarToday className="text-[#F71875] text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium">
                        {new Date(event.event_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {event.start_time && (
                    <div className="flex items-center gap-3">
                      <MdEvent className="text-[#F71875] text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Horário</p>
                        <p className="font-medium">{event.start_time}</p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MdLocationOn className="text-[#F71875] text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Local</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <MdPeople className="text-[#F71875] text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Convidados</p>
                      <p className="font-medium">{event.guest_count} pessoas</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Descrição</p>
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                )}
              </div>

              {/* Serviços */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[#520029]">Serviços</h2>
                  <button
                    onClick={() => setAddServiceModalOpen(true)}
                    className="bg-[#F71875] hover:bg-[#E6006F] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <MdAdd />
                    Adicionar Serviço
                  </button>
                </div>

                {eventServices.length === 0 ? (
                  <div className="text-center py-12">
                    <MdShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhum serviço adicionado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Adicione serviços para completar sua festa
                    </p>
                    <button
                      onClick={() => setAddServiceModalOpen(true)}
                      className="bg-[#F71875] hover:bg-[#E6006F] text-white px-6 py-3 rounded-lg font-medium"
                    >
                      Adicionar Primeiro Serviço
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {eventServices.map((eventService) => (
                      <div key={eventService.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {eventService.service?.name || 'Serviço'}
                            </h3>
                                                         <p className="text-sm text-gray-500">
                               {eventService.service?.provider?.organization_name || eventService.service?.provider?.full_name || 'Prestador'}
                             </p>
                            {eventService.total_estimated_price && (
                              <p className="text-lg font-bold text-[#F71875] mt-2">
                                {formatCurrency(eventService.total_estimated_price)}
                              </p>
                            )}
                            {eventService.client_notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <strong>Observações:</strong> {eventService.client_notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(eventService.booking_status)}`}>
                              {getStatusText(eventService.booking_status)}
                            </span>
                            <button
                              onClick={() => handleRemoveService(eventService.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <MdClose />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status da Festa */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-[#520029] mb-4">Status da Festa</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status atual:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      event.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === 'draft' ? 'Rascunho' :
                       event.status === 'planning' ? 'Planejamento' :
                       event.status === 'confirmed' ? 'Confirmada' :
                       event.status === 'completed' ? 'Realizada' :
                       event.status === 'cancelled' ? 'Cancelada' : event.status}
                    </span>
                  </div>
                  
                  {eventServices.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Serviços:</span>
                      <span className="text-sm font-medium">
                        {eventServices.filter(es => es.booking_status === 'approved').length} de {eventServices.length} confirmados
                      </span>
                    </div>
                  )}
                </div>

                {event.status === 'draft' && eventServices.length > 0 && (
                  <button
                    onClick={handleConfirmEvent}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Confirmar Festa
                  </button>
                )}

                {allServicesConfirmed && event.status === 'confirmed' && (
                  <button
                    onClick={handleCreateBooking}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MdCheck />
                    Finalizar Agendamento
                  </button>
                )}
              </div>

              {/* Resumo Financeiro */}
              {eventServices.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-[#520029] mb-4">Resumo Financeiro</h3>
                  <div className="space-y-3">
                    {eventServices
                      .filter(es => es.booking_status === 'approved' && es.total_estimated_price)
                      .map((eventService) => (
                        <div key={eventService.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {eventService.service?.name || 'Serviço'}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(eventService.total_estimated_price || 0)}
                          </span>
                        </div>
                      ))}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-[#F71875]">
                          {formatCurrency(getTotalPrice())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Editar Festa */}
        <AnimatePresence>
          {isEditModalOpen && (
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h2 className="text-2xl font-bold">Editar Festa</h2>
                      <p className="text-purple-100">Atualize os detalhes da sua festa</p>
                    </div>
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                      <MdClose className="text-2xl" />
                    </button>
                  </div>
                </div>

                <PartyConfigForm
                  initialData={{
                    title: event.title,
                    description: event.description || '',
                    event_date: event.event_date,
                    start_time: event.start_time || '',
                    location: event.location || '',
                    full_guests: Math.floor((event.guest_count || 0) * 0.6), // Estimativa
                    half_guests: Math.floor((event.guest_count || 0) * 0.3), // Estimativa
                    free_guests: Math.floor((event.guest_count || 0) * 0.1), // Estimativa
                    budget: event.budget || undefined,
                  }}
                  onComplete={handleEditSuccess}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Adicionar Serviço */}
        <AnimatePresence>
          {isAddServiceModalOpen && (
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
                <div className="bg-gradient-to-r from-[#F71875] to-[#A502CA] p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h2 className="text-xl font-bold">Adicionar Serviço</h2>
                      <p className="text-pink-100">Escolha um serviço para sua festa</p>
                    </div>
                    <button
                      onClick={() => setAddServiceModalOpen(false)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serviço
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F71875] focus:border-transparent"
                    >
                      <option value="">Selecione um serviço</option>
                      {availableServices
                        .filter(service => !eventServices.some(es => es.service_id === service.id))
                        .map((service) => (
                                                     <option key={service.id} value={service.id}>
                             {service.name}
                           </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações (opcional)
                    </label>
                    <textarea
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F71875] focus:border-transparent"
                      placeholder="Observações sobre o serviço..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setAddServiceModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddService}
                      disabled={!selectedService}
                      className="flex-1 px-4 py-2 bg-[#F71875] text-white rounded-lg hover:bg-[#E6006F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Confirmação Exclusão */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Excluir Festa"
          message="Tem certeza que deseja excluir esta festa? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />
      </div>
    </ClientLayout>
    </AuthGuard>
  );
} 