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
  MdCheckBox,
  MdCheckBoxOutlineBlank,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { getEventByIdAction, deleteEventAction } from '@/lib/actions/events';
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
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);



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



  const handleDeleteEvent = async () => {
    try {
      const result = await deleteEventAction(eventId);
      if (result.success) {
        onBack(); // Volta para a tab de minhas festas
      } else {
        setError(result.error || 'Erro ao deletar evento');
      }
    } catch (err) {
      setError('Erro ao deletar evento');
    }
  };

  const handleCancelService = async (serviceId: string) => {
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
      setCancelModalOpen(false);
      setServiceToCancel(null);
    }
  };



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Funções para seleção múltipla
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const selectAllWaitingPayment = () => {
    const waitingPaymentServices = eventServices
              .filter(service => service.booking_status === 'waiting_payment')
      .map(service => service.id);
    setSelectedServices(new Set(waitingPaymentServices));
  };

  const clearSelection = () => {
    setSelectedServices(new Set());
  };

  const getSelectedServicesTotal = () => {
    return eventServices
      .filter(service => selectedServices.has(service.id))
      .reduce((total, service) => {
        return total + calculateAdvancedPrice(service, event?.full_guests || 0, event?.half_guests || 0, event?.free_guests || 0);
      }, 0);
  };

  const handlePaySelectedServices = () => {
    const selectedServiceIds = Array.from(selectedServices);
    if (selectedServiceIds.length > 0) {
      const serviceIdsParam = selectedServiceIds.join(',');
      router.push(`/pagamento?eventId=${eventId}&services=${serviceIdsParam}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: MdEdit },
      published: { label: 'Publicada', color: 'bg-blue-100 text-blue-700', icon: MdCheckCircle },
      waiting_payment: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-700', icon: MdPayment },
      completed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: MdCheckCircle },
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
      approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700', icon: MdCheckCircle },
      completed: { label: 'Concluído', color: 'bg-purple-100 text-purple-700', icon: MdCheckCircle },
      in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', icon: MdSchedule },
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
      <div className="space-y-2 md:space-y-0">
        {/* Título e botão voltar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MdArrowBack className="text-base" />
            <span className="hidden sm:inline text-sm">Voltar para Minhas Festas</span>
            <span className="sm:hidden text-sm">Voltar</span>
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">{event.title}</h1>
          </div>
        </div>
        
        {/* Botões de ação - responsivos */}
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-1.5 sm:justify-end">
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-2.5 sm:py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium min-h-[36px] sm:min-h-auto text-xs"
          >
            <MdEdit className="text-sm" />
            Editar
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-2.5 sm:py-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors font-medium min-h-[36px] sm:min-h-auto text-xs"
          >
            <MdDelete className="text-sm" />
            Excluir
          </button>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Detalhes da Festa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <MdCalendarToday className="text-[#A502CA] text-base" />
              <div>
                <p className="text-xs text-gray-600">Data</p>
                <p className="font-medium text-xs">
                  {event.event_date ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não definida'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <MdLocationOn className="text-[#A502CA] text-base" />
              <div>
                <p className="text-xs text-gray-600">Local</p>
                <p className="font-medium text-xs">{event.location || 'Não definido'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <MdPeople className="text-[#A502CA] text-base" />
              <div>
                <p className="text-xs text-gray-600">Convidados</p>
                <p className="font-medium text-xs">{event.full_guests + event.half_guests + event.free_guests} convidados</p>
              </div>
            </div>
            {event.description && (
              <div className="flex items-start gap-1.5">
                <MdEvent className="text-[#A502CA] text-base mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Descrição</p>
                  <p className="font-medium text-xs">{event.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Services */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-gray-900">Serviços</h3>
            {selectedServices.size > 0 && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {selectedServices.size} selecionado{selectedServices.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Controles de seleção múltipla */}
            {eventServices.some(service => service.booking_status === 'waiting_payment') && (
              <>
                {selectedServices.size > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-600">
                      {selectedServices.size} serviço{selectedServices.size > 1 ? 's' : ''} selecionado{selectedServices.size > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={clearSelection}
                      className="px-1.5 py-0.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={handlePaySelectedServices}
                      className="flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                    >
                      <MdPayment className="text-xs" />
                      Pagar Selecionados ({formatPrice(getSelectedServicesTotal())})
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={selectAllWaitingPayment}
                      className="px-1.5 py-0.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Selecionar Todos para Pagamento
                    </button>
                  </div>
                )}
              </>
            )}
            <Link
              href={`/servicos?partyId=${eventId}&partyName=${encodeURIComponent(event.title)}`}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors text-xs"
            >
              <MdAdd className="text-xs" />
              Adicionar Serviço
            </Link>
          </div>
        </div>
        
        {eventServices.length > 0 ? (
          <div className="space-y-2">
            {eventServices.map((service) => (
              <div
                key={service.id}
                className={`p-2.5 border rounded-lg hover:shadow-sm transition-shadow ${
                  selectedServices.has(service.id) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5 flex-1">
                    {/* Checkbox para seleção - apenas para serviços aguardando pagamento */}
                    {service.booking_status === 'waiting_payment' && (
                      <button
                        onClick={() => toggleServiceSelection(service.id)}
                        className="mt-0.5 p-0.5 hover:bg-gray-100 rounded transition-colors"
                      >
                        {selectedServices.has(service.id) ? (
                          <MdCheckBox className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <MdCheckBoxOutlineBlank className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{service.service?.name || 'Serviço Indisponível'}</h4>
                          <p className="text-xs text-gray-600 mb-1.5 truncate">
                            por {service.provider?.full_name || service.provider?.organization_name || 'Prestador Indisponível'}
                          </p>
                          {getServiceStatusBadge(service.booking_status)}
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <span className="font-medium text-gray-900 text-xs sm:text-sm">
                            {service && service.service ? 
                              formatPrice(calculateAdvancedPrice(service, event.full_guests, event.half_guests, event.free_guests))
                              : 'Preço indisponível'
                            }
                          </span>
                        </div>
                      </div>
                      
                      {/* Ações específicas por status */}
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {service.booking_status === 'waiting_payment' && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => router.push(`/pagamento?eventId=${eventId}&services=${service.id}`)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2.5 py-1 rounded-md font-medium transition-all duration-200 flex items-center gap-1 text-xs"
                            >
                              <MdPayment className="text-xs" />
                              Pagar Agora
                            </motion.button>
                            <button
                              onClick={() => toggleServiceSelection(service.id)}
                              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                selectedServices.has(service.id)
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-gray-200'
                              }`}
                            >
                              {selectedServices.has(service.id) ? 'Selecionado' : 'Selecionar'}
                            </button>
                          </div>
                        )}

                        {service.booking_status === 'approved' && (
                          <div className="flex items-center gap-1.5">
                            <div className="text-xs text-green-600 font-medium">
                              Pagamento confirmado - Prestador notificado
                            </div>
                          </div>
                        )}

                        {service.booking_status === 'completed' && (
                          <>
                            <button
                              onClick={() => {
                                setServiceToCancel(service.id);
                                setCancelModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
                            >
                              Cancelar Serviço
                            </button>
                            <a
                              href={`https://wa.me/5511999999999?text=Olá! Gostaria de falar sobre o serviço ${service.service.name} para minha festa.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2.5 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md text-xs font-medium transition-colors"
                            >
                              <MdWhatsapp className="text-xs" />
                              WhatsApp
                            </a>
                          </>
                        )}

                        {service.booking_status === 'cancelled' && (
                          <Link
                            href="/servicos"
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-xs font-medium"
                          >
                            <MdSearch className="text-xs" />
                            Procurar Outro Serviço
                          </Link>
                        )}

                        {service.booking_status === 'pending_provider_approval' && (
                          <div className="flex items-center gap-1.5">
                            <div className="text-xs text-gray-500 italic">
                              Aguardando resposta do prestador...
                            </div>
                          </div>
                        )}

                        {service.booking_status === 'cancelled' && (
                          <div className="text-xs text-gray-500 italic">
                            Serviço cancelado
                          </div>
                        )}

                        {/* Botão de remoção para todos os status */}
                        {service.booking_status !== 'completed' && (
                          <button
                            onClick={() => {
                              setServiceToCancel(service.id);
                              setCancelModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md text-xs font-medium transition-colors"
                          >
                            <MdDelete className="text-xs" />
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <MdSearch className="text-2xl mx-auto mb-1.5 text-gray-300" />
            <p className="text-xs sm:text-sm">Nenhum serviço adicionado ainda</p>
            <p className="text-xs">Explore nossos serviços e adicione à sua festa</p>
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
            className="fixed inset-0 backdrop-blur-md bg-white/20 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mt-2 sm:mt-0"
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sticky top-0 bg-white pb-2 border-b sm:border-b-0 sm:pb-0 sm:static">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Editar Festa</h2>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 sm:p-0 -mr-1 sm:mr-0"
                  >
                    <MdClose className="text-lg sm:text-xl" />
                  </button>
                </div>
                <div className="pb-3 sm:pb-0">
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

      {/* Remove/Cancel Service Modal */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false);
          setServiceToCancel(null);
        }}
        onConfirm={() => serviceToCancel && handleCancelService(serviceToCancel)}
        title="Remover Serviço"
        message="Tem certeza que deseja remover este serviço da sua festa? Esta ação não pode ser desfeita."
        confirmLabel="Remover Serviço"
        cancelLabel="Manter Serviço"
        confirmVariant="danger"
      />
    </div>
  );
}
