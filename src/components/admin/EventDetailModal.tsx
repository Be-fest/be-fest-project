'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    MdClose,
    MdCalendarToday,
    MdLocationOn,
    MdPeople,
    MdChat,
    MdBlock,
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdPayment,
    MdPerson,
    MdEmail,
    MdAttachMoney
} from 'react-icons/md';
import { AgendaEvent } from '@/lib/actions/agenda';

interface EventDetailModalProps {
    event: AgendaEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onChatClick: (eventServiceId: string) => void;
}

const statusConfigs: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    pending_provider_approval: {
        label: 'Pendente de Aprovação',
        color: 'bg-yellow-100 text-yellow-800',
        icon: MdPending
    },
    approved: {
        label: 'Aprovado',
        color: 'bg-green-100 text-green-800',
        icon: MdCheckCircle
    },
    waiting_payment: {
        label: 'Aguardando Pagamento',
        color: 'bg-blue-100 text-blue-800',
        icon: MdPayment
    },
    in_progress: {
        label: 'Em Andamento',
        color: 'bg-purple-100 text-purple-800',
        icon: MdCheckCircle
    },
    completed: {
        label: 'Concluído',
        color: 'bg-gray-100 text-gray-800',
        icon: MdCheckCircle
    },
    cancelled: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800',
        icon: MdCancel
    }
};

export function EventDetailModal({ event, isOpen, onClose, onChatClick }: EventDetailModalProps) {
    if (!event) return null;

    const statusConfig = statusConfigs[event.booking_status] || statusConfigs.pending_provider_approval;
    const StatusIcon = statusConfig.icon;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) return 'A definir';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

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
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h2 className="text-xl font-bold truncate">{event.event_title}</h2>
                                        <p className="text-purple-100 text-sm mt-1">{event.service_name}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <MdClose className="text-2xl" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
                                        <StatusIcon className="text-base" />
                                        {statusConfig.label}
                                    </span>
                                </div>

                                {/* Event Details */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MdCalendarToday className="text-xl text-gray-400 flex-shrink-0" />
                                        <span className="capitalize">{formatDate(event.event_date)}</span>
                                    </div>

                                    {event.event_location && (
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <MdLocationOn className="text-xl text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span>{event.event_location}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MdPeople className="text-xl text-gray-400 flex-shrink-0" />
                                        <span>{event.guest_count} convidados</span>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MdAttachMoney className="text-xl text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(event.total_estimated_price)}
                                        </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <hr className="border-gray-200" />

                                {/* Client Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                        Informações do Cliente
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <MdPerson className="text-xl text-gray-400 flex-shrink-0" />
                                            <span>{event.client_name || 'Nome não informado'}</span>
                                        </div>
                                        {event.client_email && (
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <MdEmail className="text-xl text-gray-400 flex-shrink-0" />
                                                <a
                                                    href={`mailto:${event.client_email}`}
                                                    className="text-purple-600 hover:underline"
                                                >
                                                    {event.client_email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Provider Info */}
                                {event.provider_name && (
                                    <>
                                        <hr className="border-gray-200" />
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                Prestador
                                            </h3>
                                            <div className="flex items-center gap-3 text-gray-700">
                                                <MdPerson className="text-xl text-gray-400 flex-shrink-0" />
                                                <span>{event.provider_name}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <button
                                    onClick={() => onChatClick(event.event_service_id)}
                                    disabled={!event.can_chat}
                                    className={`
                    w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${event.can_chat
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }
                  `}
                                >
                                    {event.can_chat ? (
                                        <>
                                            <MdChat className="text-xl" />
                                            Abrir Chat com Cliente
                                        </>
                                    ) : (
                                        <>
                                            <MdBlock className="text-xl" />
                                            Chat Indisponível
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
