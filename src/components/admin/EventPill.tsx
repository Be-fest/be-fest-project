'use client';

import { motion } from 'framer-motion';
import {
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdPayment
} from 'react-icons/md';
import { AgendaEvent } from '@/lib/actions/agenda';

interface EventPillProps {
    event: AgendaEvent;
    onClick: () => void;
    compact?: boolean;
}

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pending_provider_approval: {
        bg: 'bg-yellow-50',
        border: 'border-l-yellow-500',
        text: 'text-yellow-800'
    },
    approved: {
        bg: 'bg-green-50',
        border: 'border-l-green-500',
        text: 'text-green-800'
    },
    waiting_payment: {
        bg: 'bg-blue-50',
        border: 'border-l-blue-500',
        text: 'text-blue-800'
    },
    in_progress: {
        bg: 'bg-purple-50',
        border: 'border-l-purple-500',
        text: 'text-purple-800'
    },
    completed: {
        bg: 'bg-gray-50',
        border: 'border-l-gray-500',
        text: 'text-gray-800'
    },
    cancelled: {
        bg: 'bg-red-50',
        border: 'border-l-red-500',
        text: 'text-red-800'
    }
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    pending_provider_approval: MdPending,
    approved: MdCheckCircle,
    waiting_payment: MdPayment,
    in_progress: MdCheckCircle,
    completed: MdCheckCircle,
    cancelled: MdCancel
};

export function EventPill({ event, onClick, compact = false }: EventPillProps) {
    const colors = statusColors[event.booking_status] || statusColors.pending_provider_approval;
    const StatusIcon = statusIcons[event.booking_status] || MdPending;

    if (compact) {
        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className={`
          w-full text-left px-2 py-1 rounded text-xs font-medium truncate
          border-l-2 ${colors.bg} ${colors.border} ${colors.text}
          hover:shadow-sm transition-shadow cursor-pointer
        `}
                title={`${event.event_title} - ${event.service_name}`}
            >
                {event.event_title}
            </motion.button>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
        w-full text-left px-3 py-2 rounded-lg
        border-l-4 ${colors.bg} ${colors.border}
        hover:shadow-md transition-all cursor-pointer
      `}
        >
            <div className="flex items-start gap-2">
                <StatusIcon className={`text-sm mt-0.5 flex-shrink-0 ${colors.text}`} />
                <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm truncate ${colors.text}`}>
                        {event.event_title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                        {event.service_name}
                    </p>
                    {event.client_name && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                            {event.client_name}
                        </p>
                    )}
                </div>
            </div>
        </motion.button>
    );
}
