'use client';

import { motion } from 'framer-motion';
import {
    MdCalendarToday,
    MdLocationOn,
    MdPeople,
    MdChat,
    MdBlock,
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdPayment
} from 'react-icons/md';
import { AgendaEvent } from '@/lib/actions/agenda';

interface EventCardProps {
    event: AgendaEvent;
    onClick: () => void;
    onChatClick: () => void;
}

export function EventCard({ event, onClick, onChatClick }: EventCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        });
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) return 'A definir';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending_provider_approval':
                return {
                    label: 'Pendente',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: MdPending
                };
            case 'approved':
                return {
                    label: 'Aprovado',
                    color: 'bg-green-100 text-green-800',
                    icon: MdCheckCircle
                };
            case 'waiting_payment':
                return {
                    label: 'Aguard. Pagamento',
                    color: 'bg-blue-100 text-blue-800',
                    icon: MdPayment
                };
            case 'in_progress':
                return {
                    label: 'Em Andamento',
                    color: 'bg-purple-100 text-purple-800',
                    icon: MdCheckCircle
                };
            case 'completed':
                return {
                    label: 'Concluído',
                    color: 'bg-gray-100 text-gray-800',
                    icon: MdCheckCircle
                };
            case 'cancelled':
                return {
                    label: 'Cancelado',
                    color: 'bg-red-100 text-red-800',
                    icon: MdCancel
                };
            default:
                return {
                    label: status,
                    color: 'bg-gray-100 text-gray-800',
                    icon: MdPending
                };
        }
    };

    const statusConfig = getStatusConfig(event.booking_status);
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex-1 min-w-0">
                    {/* Title and status */}
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{event.event_title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="text-sm" />
                            {statusConfig.label}
                        </span>
                    </div>

                    {/* Service name */}
                    <p className="text-sm text-purple-600 font-medium mb-2">{event.service_name}</p>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <MdCalendarToday className="text-gray-400" />
                            <span>{formatDate(event.event_date)}</span>
                        </div>
                        {event.event_location && (
                            <div className="flex items-center gap-1">
                                <MdLocationOn className="text-gray-400" />
                                <span className="truncate max-w-[150px]">{event.event_location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <MdPeople className="text-gray-400" />
                            <span>{event.guest_count} convidados</span>
                        </div>
                    </div>

                    {/* Client and value */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-600">
                            Cliente: <strong>{event.client_name || 'N/A'}</strong>
                        </span>
                        <span className="text-green-600 font-medium">
                            {formatCurrency(event.total_estimated_price)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onChatClick();
                        }}
                        disabled={!event.can_chat}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${event.can_chat
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }
            `}
                        title={event.can_chat ? 'Abrir chat' : 'Chat indisponível'}
                    >
                        {event.can_chat ? (
                            <>
                                <MdChat className="text-lg" />
                                <span>Chat</span>
                            </>
                        ) : (
                            <>
                                <MdBlock className="text-lg" />
                                <span>Chat</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
