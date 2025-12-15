'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose,
  MdEvent,
  MdPerson,
  MdWork,
  MdCalendarToday,
  MdAccessTime,
  MdPeople,
  MdAttachMoney,
  MdLocationOn,
  MdChat,
  MdCheckCircle,
  MdPending,
  MdPayment,
  MdCancel,
  MdHourglassEmpty,
  MdDescription
} from 'react-icons/md';
import { EventWithServices } from '@/types/database';
import { formatCurrency, formatEventDate } from '@/utils/formatters';

interface EventDetailsModalProps {
  event: EventWithServices;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const STATUS_CONFIG = {
  pending_provider_approval: {
    label: 'Aguardando Aprovação',
    icon: MdPending,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300'
  },
  approved: {
    label: 'Aprovado',
    icon: MdCheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300'
  },
  waiting_payment: {
    label: 'Aguardando Pagamento',
    icon: MdPayment,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    border: 'border-orange-300'
  },
  paid: {
    label: 'Pago',
    icon: MdAttachMoney,
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-300'
  },
  in_progress: {
    label: 'Em Andamento',
    icon: MdHourglassEmpty,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300'
  },
  completed: {
    label: 'Concluído',
    icon: MdCheckCircle,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300'
  },
  cancelled: {
    label: 'Cancelado',
    icon: MdCancel,
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-300'
  }
};

export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onRefresh
}: EventDetailsModalProps) {
  const [observations, setObservations] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Calcular dias até o evento
  const daysUntilEvent = () => {
    const eventDate = new Date(event.event_date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Obter serviços contratados do prestador atual
  const providerServices = event.event_services.filter(es => es.provider_id);

  // Calcular preço total para o prestador
  const totalProviderPrice = providerServices.reduce(
    (sum, es) => sum + (es.total_estimated_price || 0),
    0
  );

  const handleSaveObservations = async () => {
    setIsSaving(true);
    // TODO: Implementar salvamento de observações no backend
    setTimeout(() => {
      setIsSaving(false);
      alert('Observações salvas com sucesso!');
    }, 1000);
  };

  const handleOpenChat = () => {
    // TODO: Implementar navegação para FestChat
    alert('Abrindo FestChat...');
  };

  if (!isOpen) return null;

  const daysUntil = daysUntilEvent();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-3xl sm:w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MdEvent className="text-3xl" />
                  <div>
                    <h2 className="text-xl font-bold">
                      Festa - {event.title} | {event.client?.full_name || 'Cliente'}
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">Detalhes do Evento</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>

              {/* Status do Serviço */}
              <div className="flex flex-wrap gap-2">
                {providerServices.map((service, index) => {
                  const status = service.booking_status as keyof typeof STATUS_CONFIG;
                  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_provider_approval;
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={index}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border backdrop-blur-sm`}
                    >
                      <StatusIcon className={config.color} />
                      <span className={`text-sm font-medium ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-16rem)] sm:max-h-[500px] overflow-y-auto">
              <div className="space-y-6">
                {/* Cliente */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <MdPerson className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-semibold text-gray-900">
                      {event.client?.full_name || 'Nome não disponível'}
                    </p>
                    {event.client?.whatsapp_number && (
                      <p className="text-sm text-gray-600">
                        WhatsApp: {event.client.whatsapp_number}
                      </p>
                    )}
                  </div>
                </div>

                {/* Serviços Contratados */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MdWork className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Serviço(s) Contratado(s)</p>
                    <div className="space-y-2">
                      {providerServices.map((es, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <p className="font-semibold text-gray-900">
                            {es.service?.name || 'Serviço não especificado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {es.service?.category || 'Categoria não especificada'}
                          </p>
                          <p className="text-sm font-medium text-purple-600 mt-1">
                            {formatCurrency(es.total_estimated_price || 0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <MdCalendarToday className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data do Evento</p>
                      <p className="font-semibold text-gray-900">
                        {formatEventDate(event.event_date)}
                      </p>
                      <p className={`text-sm font-medium ${daysUntil < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {daysUntil < 0
                          ? `Passou há ${Math.abs(daysUntil)} dia(s)`
                          : daysUntil === 0
                          ? 'Hoje!'
                          : `Faltam ${daysUntil} dia(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <MdAccessTime className="text-orange-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horário e Duração</p>
                      <p className="font-semibold text-gray-900">
                        Início: {event.start_time || '18:00'}
                      </p>
                      <p className="text-sm text-gray-600">Duração: 5 horas</p>
                    </div>
                  </div>
                </div>

                {/* Local */}
                {event.location && (
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-pink-100 rounded-lg">
                      <MdLocationOn className="text-pink-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Local do Evento</p>
                      <p className="font-semibold text-gray-900">{event.location}</p>
                    </div>
                  </div>
                )}

                {/* Número de Convidados */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <MdPeople className="text-indigo-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Número de Convidados</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {event.full_guests || 0}
                        </p>
                        <p className="text-xs text-gray-600">Integrais</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {event.half_guests || 0}
                        </p>
                        <p className="text-xs text-gray-600">Meias</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {event.free_guests || 0}
                        </p>
                        <p className="text-xs text-gray-600">Grátis</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        Total: {event.guest_count || 0} convidados
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preços */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MdAttachMoney className="text-purple-600 text-xl" />
                    <p className="font-semibold text-gray-900">Valores para o Prestador</p>
                  </div>

                  <div className="space-y-3">
                    {providerServices.map((es, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm text-gray-700">
                          {es.service?.name || `Serviço ${index + 1}`}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-xs text-gray-500">Preço/Convidado Integral</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(es.price_per_guest_at_booking || 0)}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <p className="text-xs text-gray-500">Preço/Convidado Meia</p>
                            <p className="font-semibold text-gray-900">
                              {formatCurrency((es.price_per_guest_at_booking || 0) / 2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-purple-300 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Preço Total:</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {formatCurrency(totalProviderPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MdDescription className="text-gray-600 text-xl" />
                    <label className="font-semibold text-gray-900">Observações</label>
                  </div>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Adicione observações sobre este evento..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <button
                    onClick={handleSaveObservations}
                    disabled={isSaving}
                    className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Observações'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleOpenChat}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                >
                  <MdChat className="text-xl" />
                  <span className="font-medium">Abrir FestChat</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
