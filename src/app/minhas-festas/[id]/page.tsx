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
  MdCheck,
  MdClose,
  MdWarning,
  MdAttachMoney,
  MdEvent,
  MdPerson,
  MdPersonOutline,
  MdFace,
  MdPayment,
  MdSearch,
  MdWhatsapp,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getEventByIdAction, updateEventStatusAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction, deleteEventServiceAction } from '@/lib/actions/event-services';
import { Event, EventWithServices, EventServiceWithDetails } from '@/types/database';
import { ClientLayout } from '@/components/client';
import { FastAuthGuard } from '@/components/FastAuthGuard';
import { calculateAdvancedPrice, formatGuestsInfo } from '@/utils/formatters';

export default function PartyDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  
  const router = useRouter();
  
  const [event, setEvent] = useState<EventWithServices | null>(null);
  const [eventServices, setEventServices] = useState<EventServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [serviceToCancel, setServiceToCancel] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedServicesForPayment, setSelectedServicesForPayment] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventResult, servicesResult] = await Promise.all([
        getEventByIdAction(eventId),
        getEventServicesAction({ event_id: eventId }),
      ]);
      
      if (eventResult.success && eventResult.data) {
        setEvent(eventResult.data);
      } else {
        setError(eventResult.error || 'Erro ao carregar dados do evento');
      }
      
      if (servicesResult.success && servicesResult.data) {
        setEventServices(servicesResult.data);
      } else {
        console.error('Erro ao carregar serviços:', servicesResult.error);
      }
    } catch (err) {
      setError('Erro inesperado ao carregar dados');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading('status');
    try {
      const result = await updateEventStatusAction(eventId, newStatus);
      if (result.success) {
        setEvent((prev) => prev ? { ...prev, status: newStatus as any } : null);
        fetchEventData();
      } else {
        setError(result.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      setError('Erro ao atualizar status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteEvent = async () => {
    setActionLoading('delete');
    try {
      const result = await deleteEventAction(eventId);
      if (result.success) {
        router.push('/minhas-festas');
      } else {
        setError(result.error || 'Erro ao deletar evento');
      }
    } catch (err) {
      setError('Erro ao deletar evento');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelService = async (serviceId: string) => {
    setActionLoading('cancel');
    try {
      const result = await deleteEventServiceAction(serviceId);
      if (result.success) {
        setEventServices(prev => prev.filter(service => service.id !== serviceId));
      } else {
        setError(result.error || 'Erro ao cancelar serviço');
      }
    } catch (err) {
      setError('Erro ao cancelar serviço');
    } finally {
      setActionLoading(null);
      setCancelModalOpen(false);
      setServiceToCancel(null);
    }
  };

  const handlePayment = () => {
    const selectedServices = eventServices.filter(service => 
      selectedServicesForPayment.has(service.id)
    );
    
    if (selectedServices.length === 0) {
      alert('Selecione pelo menos um serviço para pagamento');
      return;
    }
    
    router.push(`/pagamento?eventId=${eventId}&services=${selectedServices.map(s => s.id).join(',')}`);
  };

  const getActionButton = (event: EventWithServices) => {
    if (!event.status) return null;

    switch (event.status) {
      case 'draft':
        return (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateStatus('published')}
            disabled={actionLoading === 'status'}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <MdCheck className="text-xl" />
            {actionLoading === 'status' ? 'Publicando...' : 'Publicar Festa'}
          </motion.button>
        );
      case 'published':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <MdCheck className="text-green-500 text-2xl mx-auto mb-2" />
            <p className="text-green-700 font-medium">Festa publicada</p>
            <p className="text-green-600 text-sm">Aguardando propostas dos prestadores</p>
          </div>
        );
      case 'waiting_payment':
        return (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={selectedServicesForPayment.size === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <MdPayment className="text-xl" />
              Fazer Pagamento
            </motion.button>
            <p className="text-sm text-gray-600 mt-2">
              Selecione os serviços que deseja pagar
            </p>
          </>
        );
      case 'completed':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <MdEvent className="text-blue-500 text-2xl mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Festa confirmada</p>
            <p className="text-blue-600 text-sm">Todos os serviços foram confirmados</p>
          </div>
        );
      case 'cancelled':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <MdClose className="text-red-500 text-2xl mx-auto mb-2" />
            <p className="text-red-700 font-medium">Festa cancelada</p>
            <p className="text-red-600 text-sm">Esta festa foi cancelada</p>
          </div>
        );
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
      published: { label: 'Publicada', color: 'bg-blue-100 text-blue-700' },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-700' },
      completed: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
    }[status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getServiceStatusBadge = (booking_status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-orange-100 text-orange-700' },
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700' },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
    }[booking_status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700' };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  if (loading) {
    return (
      <FastAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </ClientLayout>
      </FastAuthGuard>
    );
  }

  if (error) {
    return (
      <FastAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="text-center py-12">
            <MdWarning className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dados</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={fetchEventData}
              className="bg-[#A502CA] text-white px-6 py-3 rounded-lg hover:bg-[#8B0A9E] transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </ClientLayout>
      </FastAuthGuard>
    );
  }

  if (!event) {
    return (
      <FastAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="text-center py-12">
            <MdWarning className="text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Festa não encontrada</h2>
            <p className="text-gray-600 mb-8">
              A festa que você está procurando não existe ou foi removida.
            </p>
            <Link
              href="/minhas-festas"
              className="bg-[#A502CA] text-white px-6 py-3 rounded-lg hover:bg-[#8B0A9E] transition-colors"
            >
              Voltar para Minhas Festas
            </Link>
          </div>
        </ClientLayout>
      </FastAuthGuard>
    );
  }

  return (
    <FastAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/minhas-festas"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MdArrowBack className="text-xl" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(event.status || 'draft')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdEdit className="text-lg" />
                Editar
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <MdDelete className="text-lg" />
                Excluir
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da Festa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MdCalendarToday className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Data</p>
                    <p className="text-gray-600">
                      {new Date(event.event_date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3">
                    <MdLocationOn className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Local</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MdPeople className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Convidados</p>
                    <p className="text-gray-600">{formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)}</p>
                  </div>
                </div>
                {event.description && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Descrição</p>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Serviços</h2>
              <Link
                href="/servicos"
                className="flex items-center gap-2 bg-[#A502CA] text-white px-4 py-2 rounded-lg hover:bg-[#8B0A9E] transition-colors"
              >
                <MdAdd className="text-lg" />
                Adicionar Serviço
              </Link>
            </div>

            {eventServices.length === 0 ? (
              <div className="text-center py-8">
                <MdSearch className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Nenhum serviço adicionado ainda</p>
                <Link
                  href="/servicos"
                  className="text-[#A502CA] hover:text-[#8B0A9E] font-medium"
                >
                  Explorar Serviços
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {eventServices.map((service) => (
                  <div
                    key={service.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-start gap-4"
                  >
                    {event.status === 'waiting_payment' && (
                      <input
                        type="checkbox"
                        checked={selectedServicesForPayment.has(service.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedServicesForPayment);
                          if (e.target.checked) {
                            newSelected.add(service.id);
                          } else {
                            newSelected.delete(service.id);
                          }
                          setSelectedServicesForPayment(newSelected);
                        }}
                        className="mt-1 w-4 h-4 text-[#A502CA] rounded focus:ring-[#A502CA]"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{service.service.name}</h3>
                          <p className="text-sm text-gray-600">
                            por {service.provider.full_name || service.provider.organization_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getServiceStatusBadge(service.booking_status)}
                          <span className="font-medium text-gray-900">
                            {formatPrice(calculateAdvancedPrice(service.service, event.full_guests, event.half_guests, event.free_guests))}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{service.service.description}</p>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {service.booking_status === 'confirmed' && (
                          <button
                            onClick={() => {
                              setServiceToCancel(service.id);
                              setCancelModalOpen(true);
                            }}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancelar Serviço
                          </button>
                        )}
                        {service.booking_status === 'rejected' && (
                          <Link
                            href="/servicos"
                            className="text-sm text-[#A502CA] hover:text-[#8B0A9E] font-medium"
                          >
                            Procurar Outro Serviço
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            {getActionButton(event)}
          </div>
        </div>

        {/* Modais */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Editar Festa</h2>
                    <button
                      onClick={() => setEditModalOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                  <PartyConfigForm
                    initialData={{
                      title: event.title,
                      description: event.description || '',
                      event_date: event.event_date.split('T')[0],
                      start_time: event.start_time || '',
                      location: event.location || '',
                      full_guests: event.full_guests || 0,
                      half_guests: event.half_guests || 0,
                      free_guests: event.free_guests || 0,
                    }}
                    eventId={event.id}
                    onComplete={() => {
                      setEditModalOpen(false);
                      fetchEventData();
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteEvent}
          title="Excluir Festa"
          message="Tem certeza que deseja excluir esta festa? Esta ação não pode ser desfeita."
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          confirmVariant="danger"
        />

        <ConfirmationModal
          isOpen={cancelModalOpen}
          onCancel={() => {
            setCancelModalOpen(false);
            setServiceToCancel(null);
          }}
          onConfirm={() => serviceToCancel && handleCancelService(serviceToCancel)}
          title="Cancelar Serviço"
          message="Tem certeza que deseja cancelar este serviço? Lembre-se de que o cancelamento deve ser feito com pelo menos 48 horas de antecedência."
          confirmLabel="Cancelar Serviço"
          cancelLabel="Manter Serviço"
          confirmVariant="danger"
        />
      </ClientLayout>
    </FastAuthGuard>
  );
} 