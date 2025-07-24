'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  MdCheckCircle,
  MdSchedule,
  MdAssignmentTurnedIn,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getEventByIdAction, updateEventStatusAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction, deleteEventServiceAction } from '@/lib/actions/event-services';
import { Event, EventWithServices, EventServiceWithDetails } from '@/types/database';
import { calculateAdvancedPrice, formatGuestsInfo } from '@/utils/formatters';

interface PartyDetailsTabProps {
  eventId: string;
  onBack: () => void;
}

export function PartyDetailsTab({ eventId, onBack }: PartyDetailsTabProps) {
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
  const [selectAllServices, setSelectAllServices] = useState(false);

  // Função para buscar dados do evento
  const fetchEventData = useCallback(async () => {
    if (!eventId) return;
    
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
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading('status');
    try {
      const result = await updateEventStatusAction(eventId, newStatus);
      if (result.success) {
        setEvent((prev) => prev ? { ...prev, status: newStatus as any } : null);
        if (newStatus === 'completed' || newStatus === 'cancelled') {
          fetchEventData();
        }
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
        onBack(); // Volta para a tab de minhas festas
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

  const handleSelectAllServices = (checked: boolean) => {
    setSelectAllServices(checked);
    if (checked) {
      const servicesWaitingPayment = eventServices.filter(service => service.booking_status === 'waiting_payment');
      setSelectedServicesForPayment(new Set(servicesWaitingPayment.map(s => s.id)));
    } else {
      setSelectedServicesForPayment(new Set());
    }
  };

  const handleServiceSelect = (serviceId: string, checked: boolean) => {
    const newSelected = new Set(selectedServicesForPayment);
    if (checked) {
      newSelected.add(serviceId);
    } else {
      newSelected.delete(serviceId);
    }
    setSelectedServicesForPayment(newSelected);
    
    const servicesWaitingPayment = eventServices.filter(service => service.booking_status === 'waiting_payment');
    setSelectAllServices(newSelected.size === servicesWaitingPayment.length);
  };

  const handleConfirmScheduling = async () => {
    await handleUpdateStatus('completed');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: MdEdit },
      published: { label: 'Publicada', color: 'bg-blue-100 text-blue-700', icon: MdCheckCircle },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-700', icon: MdPayment },
      completed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: MdAssignmentTurnedIn },
      cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: MdClose },
    }[status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700', icon: MdWarning };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        <statusConfig.icon className="w-4 h-4 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getServiceStatusBadge = (booking_status: string) => {
    const statusConfig = {
      pending_provider_approval: { label: 'Aguardando Aprovação do Prestador', color: 'bg-yellow-100 text-yellow-700', icon: MdSchedule },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-orange-100 text-orange-700', icon: MdPayment },
      confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-700', icon: MdCheckCircle },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700', icon: MdClose },
      cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700', icon: MdClose },
    }[booking_status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-700', icon: MdWarning };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <statusConfig.icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getActionButtons = () => {
    if (!event) return null;

    const servicesWaitingPayment = eventServices.filter(service => service.booking_status === 'waiting_payment');
    const confirmedServices = eventServices.filter(service => service.booking_status === 'confirmed');
    const allServicesPaid = servicesWaitingPayment.length > 0 && confirmedServices.length === servicesWaitingPayment.length;

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
            <MdCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
            <p className="text-green-700 font-medium">Festa publicada</p>
            <p className="text-green-600 text-sm">Aguardando propostas dos prestadores</p>
          </div>
        );

      case 'waiting_payment':
        if (servicesWaitingPayment.length > 0) {
          return (
            <>
              {allServicesPaid ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmScheduling}
                  disabled={actionLoading === 'status'}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <MdAssignmentTurnedIn className="text-xl" />
                  {actionLoading === 'status' ? 'Confirmando...' : 'Confirmar Agendamento'}
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={selectAllServices}
                      onChange={(e) => handleSelectAllServices(e.target.checked)}
                      className="w-4 h-4 text-[#A502CA] rounded focus:ring-[#A502CA]"
                    />
                    <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                      Selecionar todos os serviços aguardando pagamento
                    </label>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePayment}
                    disabled={selectedServicesForPayment.size === 0}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                  >
                    <MdPayment className="text-xl" />
                    Pagar Serviços Selecionados ({selectedServicesForPayment.size})
                  </motion.button>
                </div>
              )}
            </>
          );
        }
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <MdSchedule className="text-yellow-500 text-2xl mx-auto mb-2" />
            <p className="text-yellow-700 font-medium">Aguardando aprovação</p>
            <p className="text-yellow-600 text-sm">Nenhum serviço aprovado ainda</p>
          </div>
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
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
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <MdWarning className="text-gray-400 text-6xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Festa não encontrada</h2>
        <p className="text-gray-600 mb-8">
          A festa que você está procurando não existe ou foi removida.
        </p>
        <button
          onClick={onBack}
          className="bg-[#A502CA] text-white px-6 py-3 rounded-lg hover:bg-[#8B0A9E] transition-colors"
        >
          Voltar para Minhas Festas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MdArrowBack className="text-xl" />
            Voltar para Minhas Festas
          </button>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalhes da Festa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MdCalendarToday className="text-[#A502CA] text-xl" />
              <div>
                <p className="text-sm text-gray-600">Data</p>
                <p className="font-medium">
                  {event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : 'Não definida'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdLocationOn className="text-[#A502CA] text-xl" />
              <div>
                <p className="text-sm text-gray-600">Local</p>
                <p className="font-medium">{event.location || 'Não definido'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MdPeople className="text-[#A502CA] text-xl" />
              <div>
                <p className="text-sm text-gray-600">Convidados</p>
                <p className="font-medium">{formatGuestsInfo(event.full_guests, event.half_guests, event.free_guests)}</p>
              </div>
            </div>
            {event.description && (
              <div className="flex items-start gap-3">
                <MdEvent className="text-[#A502CA] text-xl mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Descrição</p>
                  <p className="font-medium">{event.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações</h3>
        {getActionButtons()}
      </div>

      {/* Services */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Serviços</h3>
          <Link
            href={`/servicos?partyId=${eventId}&partyName=${encodeURIComponent(event.title)}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors"
          >
            <MdAdd className="text-lg" />
            Adicionar Serviço
          </Link>
        </div>
        
        {eventServices.length > 0 ? (
          <div className="space-y-4">
            {eventServices.map((service) => (
              <div
                key={service.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Checkbox para seleção de pagamento */}
                    {service.booking_status === 'waiting_payment' && event.status === 'waiting_payment' && (
                      <input
                        type="checkbox"
                        checked={selectedServicesForPayment.has(service.id)}
                        onChange={(e) => handleServiceSelect(service.id, e.target.checked)}
                        className="w-4 h-4 text-[#A502CA] rounded focus:ring-[#A502CA] mt-1"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.service?.name || 'Serviço Indisponível'}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            por {service.provider?.full_name || service.provider?.organization_name || 'Prestador Indisponível'}
                          </p>
                          {getServiceStatusBadge(service.booking_status)}
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-900 text-lg">
                            {service && service.service ? 
                              formatPrice(calculateAdvancedPrice(service, event.full_guests, event.half_guests, event.free_guests))
                              : 'Preço indisponível'
                            }
                          </span>
                        </div>
                      </div>
                      
                      {/* Ações específicas por status */}
                      <div className="mt-3 flex items-center gap-3">
                        {service.booking_status === 'waiting_payment' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push(`/pagamento?eventId=${eventId}&services=${service.id}`)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
                          >
                            <MdPayment className="text-lg" />
                            Pagar Agora
                          </motion.button>
                        )}

                        {service.booking_status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => {
                                setServiceToCancel(service.id);
                                setCancelModalOpen(true);
                              }}
                              className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancelar Serviço
                            </button>
                            <a
                              href={`https://wa.me/5511999999999?text=Olá! Gostaria de falar sobre o serviço ${service.service.name} para minha festa.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-4 py-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              <MdWhatsapp className="text-lg" />
                              WhatsApp
                            </a>
                          </>
                        )}

                        {service.booking_status === 'rejected' && (
                          <Link
                            href="/servicos"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            <MdSearch className="text-lg" />
                            Procurar Outro Serviço
                          </Link>
                        )}

                        {service.booking_status === 'pending_provider_approval' && (
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-500 italic">
                              Aguardando resposta do prestador...
                            </div>
                            <Link
                              href="/servicos"
                              className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                            >
                              <MdSearch className="text-base" />
                              Buscar Alternativo
                            </Link>
                          </div>
                        )}

                        {service.booking_status === 'cancelled' && (
                          <div className="text-sm text-gray-500 italic">
                            Serviço cancelado
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MdSearch className="text-4xl mx-auto mb-2 text-gray-300" />
            <p>Nenhum serviço adicionado ainda</p>
            <p className="text-sm">Explore nossos serviços e adicione à sua festa</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Editar Festa</h2>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose className="text-2xl" />
                  </button>
                </div>
                <PartyConfigForm
                  eventId={eventId}
                  initialData={{
                    title: event.title,
                    description: event.description || '',
                    event_date: event.event_date,
                    start_time: event.start_time || '',
                    location: event.location || '',
                    full_guests: event.full_guests || 0,
                    half_guests: event.half_guests || 0,
                    free_guests: event.free_guests || 0,
                  }}
                  onComplete={() => {
                    setEditModalOpen(false);
                    fetchEventData();
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
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

      {/* Cancel Service Modal */}
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
    </div>
  );
}
