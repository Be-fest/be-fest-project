'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MdEvent,
    MdCalendarToday,
    MdPeople,
    MdCheckCircle,
    MdPending,
    MdError,
    MdArrowBack
} from 'react-icons/md';
import { startOfWeek, startOfMonth, addDays, addMonths, format } from 'date-fns';
import { getAgendaEventsByWeekAction, getAgendaEventsByMonthAction, AgendaEvent } from '@/lib/actions/agenda';
import { CalendarHeader } from '@/components/admin/CalendarHeader';
import { CalendarGrid } from '@/components/admin/CalendarGrid';
import { EventDetailModal } from '@/components/admin/EventDetailModal';
import { ChatModal } from '@/components/admin/ChatModal';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { AuthGuard } from '@/components/AuthGuard';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type ViewType = 'week' | 'month';

export default function ProviderAgendaPage() {
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [viewType, setViewType] = useState<ViewType>('week');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Event detail modal state
    const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Chat modal state
    const [selectedEventServiceId, setSelectedEventServiceId] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Get current user (provider)
    useEffect(() => {
        const getUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        getUser();
    }, []);

    const loadEvents = async () => {
        if (!currentUserId) return;

        try {
            setLoading(true);
            setError(null);

            let result;
            if (viewType === 'week') {
                const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
                const weekStartStr = format(weekStart, 'yyyy-MM-dd');
                // Pass providerId to filter only this provider's events
                result = await getAgendaEventsByWeekAction(weekStartStr, currentUserId);
            } else {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                // Pass providerId to filter only this provider's events
                result = await getAgendaEventsByMonthAction(year, month, currentUserId);
            }

            if (result.success && result.data) {
                setEvents(result.data);
            } else {
                setError(result.error || 'Erro ao carregar eventos');
            }
        } catch (err) {
            console.error('Erro ao carregar eventos:', err);
            setError('Erro ao carregar lista de eventos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUserId) {
            loadEvents();
        }
    }, [currentDate, viewType, currentUserId]);

    const handlePrevious = () => {
        if (viewType === 'week') {
            setCurrentDate(prev => addDays(prev, -7));
        } else {
            setCurrentDate(prev => addMonths(prev, -1));
        }
    };

    const handleNext = () => {
        if (viewType === 'week') {
            setCurrentDate(prev => addDays(prev, 7));
        } else {
            setCurrentDate(prev => addMonths(prev, 1));
        }
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleViewTypeChange = (view: ViewType) => {
        setViewType(view);
    };

    const handleEventClick = (event: AgendaEvent) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const handleChatClick = (eventServiceId: string) => {
        setIsDetailModalOpen(false);
        setSelectedEventServiceId(eventServiceId);
        setIsChatOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedEvent(null);
    };

    const closeChatModal = () => {
        setIsChatOpen(false);
        setSelectedEventServiceId(null);
    };

    // Stats
    const stats = {
        totalEvents: events.length,
        pendingEvents: events.filter(e => e.booking_status === 'pending_provider_approval').length,
        approvedEvents: events.filter(e => ['approved', 'waiting_payment', 'in_progress'].includes(e.booking_status)).length,
        totalGuests: events.reduce((sum, e) => sum + e.guest_count, 0)
    };

    if (error && events.length === 0 && !loading) {
        return (
            <AuthGuard requiredRole="provider">
                <ProviderLayout>
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <MdError className="text-red-500 text-6xl mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar eventos</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={loadEvents}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                </ProviderLayout>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard requiredRole="provider">
            <ProviderLayout>
                <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                        >
                            <div>
                                <Link
                                    href="/dashboard/prestador"
                                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 mb-2"
                                >
                                    <MdArrowBack />
                                    Voltar ao Dashboard
                                </Link>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                    <MdEvent className="text-purple-600" />
                                    Minha Agenda
                                </h1>
                                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                                    Visualize seus eventos agendados
                                </p>
                            </div>
                        </motion.div>

                        {/* Stats Cards - Compact */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                            >
                                <div className="bg-purple-50 p-2 rounded-lg">
                                    <MdCalendarToday className="text-xl text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Meus Eventos</p>
                                    <p className="text-lg font-bold text-gray-900">{stats.totalEvents}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                            >
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <MdPending className="text-xl text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Pendentes</p>
                                    <p className="text-lg font-bold text-gray-900">{stats.pendingEvents}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                            >
                                <div className="bg-green-50 p-2 rounded-lg">
                                    <MdCheckCircle className="text-xl text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Aprovados</p>
                                    <p className="text-lg font-bold text-gray-900">{stats.approvedEvents}</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-center gap-3"
                            >
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <MdPeople className="text-xl text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Convidados</p>
                                    <p className="text-lg font-bold text-gray-900">{stats.totalGuests}</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Calendar Header */}
                        <CalendarHeader
                            currentDate={currentDate}
                            viewType={viewType}
                            onViewTypeChange={handleViewTypeChange}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onToday={handleToday}
                            onRefresh={loadEvents}
                            loading={loading}
                        />

                        {/* Loading overlay */}
                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600">Carregando eventos...</p>
                                </div>
                            </div>
                        )}

                        {/* Calendar Grid */}
                        {!loading && (
                            <CalendarGrid
                                currentDate={currentDate}
                                viewType={viewType}
                                events={events}
                                onEventClick={handleEventClick}
                            />
                        )}

                        {/* Empty State */}
                        {!loading && events.length === 0 && (
                            <div className="bg-white rounded-xl p-12 text-center">
                                <MdEvent className="text-gray-300 text-6xl mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    Nenhum evento neste período
                                </h3>
                                <p className="text-gray-500">
                                    Quando você receber solicitações de serviços, elas aparecerão aqui.
                                </p>
                            </div>
                        )}

                        {/* Event Detail Modal */}
                        <EventDetailModal
                            event={selectedEvent}
                            isOpen={isDetailModalOpen}
                            onClose={closeDetailModal}
                            onChatClick={handleChatClick}
                        />

                        {/* Chat Modal */}
                        {currentUserId && selectedEventServiceId && (
                            <ChatModal
                                eventServiceId={selectedEventServiceId}
                                currentUserId={currentUserId}
                                isOpen={isChatOpen}
                                onClose={closeChatModal}
                            />
                        )}
                    </div>
                </div>
            </ProviderLayout>
        </AuthGuard>
    );
}
