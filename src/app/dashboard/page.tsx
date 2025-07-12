'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  MdArrowForward
} from 'react-icons/md';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction } from '@/lib/actions/events';
import { Event, EventStatus } from '@/types/database';

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    const result = await getClientEventsAction();
    if (result.success && result.data) {
      setEvents(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'waiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case null:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'published':
        return 'Publicado';
      case 'waiting_payment':
        return 'Aguardando Pagamento';
      case 'completed':
        return 'Realizado';
      case 'cancelled':
        return 'Cancelado';
      case null:
        return 'Sem Status';
      default:
        return status || 'Sem Status';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const quickLinks = [
    {
      title: 'Minhas Festas',
      description: 'Visualize e gerencie todos os seus eventos',
      icon: MdEvent,
      href: '/perfil?tab=minhas-festas',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      title: 'Criar Nova Festa',
      description: 'Planeje um novo evento incrível',
      icon: MdAdd,
      href: '#',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => setNewPartyModalOpen(true)
    },
    {
      title: 'Explorar Serviços',
      description: 'Encontre prestadores de serviços',
      icon: MdSearch,
      href: '/servicos',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Histórico',
      description: 'Veja seus eventos anteriores',
      icon: MdHistory,
      href: '/historico',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Configurações',
      description: 'Gerencie seu perfil e preferências',
      icon: MdSettings,
      href: '/perfil?tab=configuracoes',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    }
  ];

  const stats = [
    {
      title: 'Total de Eventos',
      value: events.length,
      icon: MdEvent,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Publicados',
      value: events.filter(e => e.status === 'published').length,
      icon: MdCheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Aguardando Pagamento',
      value: events.filter(e => e.status === 'waiting_payment').length,
      icon: MdPendingActions,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Realizados',
      value: events.filter(e => e.status === 'completed').length,
      icon: MdTrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const recentEvents = events.slice(0, 5);

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    loadEvents();
  };

  if (loading) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-8 w-48 bg-gray-300 rounded-lg animate-pulse mx-auto"></div>
              <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div className="space-y-6">
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-28 bg-gray-300 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Events Skeleton */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-gray-300 rounded"></div>
                          <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
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
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-lg">
              Bem-vindo! Acesse rapidamente as principais funcionalidades
            </p>
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

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group cursor-pointer"
                  onClick={link.onClick}
                >
                  {link.href && link.href !== '#' ? (
                    <Link href={link.href} className="block">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${link.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <link.icon className={`text-xl ${link.textColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-[#F71875] transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {link.description}
                          </p>
                        </div>
                        <MdArrowForward className="text-gray-400 group-hover:text-[#F71875] transition-colors" />
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${link.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <link.icon className={`text-xl ${link.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#F71875] transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      </div>
                      <MdArrowForward className="text-gray-400 group-hover:text-[#F71875] transition-colors" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          {recentEvents.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Eventos Recentes</h2>
                <Link
                  href="/perfil?tab=minhas-festas"
                  className="text-[#F71875] hover:text-[#E6006F] font-medium flex items-center gap-2 transition-colors"
                >
                  Ver todos
                  <MdArrowForward />
                </Link>
              </div>
              <div className="space-y-4">
                {recentEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-xl flex items-center justify-center">
                          <MdEvent className="text-white text-xl" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <MdCalendarToday className="text-xs" />
                              {formatDate(event.event_date)}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MdLocationOn className="text-xs" />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MdPeople className="text-xs" />
                              {event.guest_count} convidados
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusLabel(event.status)}
                        </span>
                        <Link
                          href={`/minhas-festas/${event.id}`}
                          className="text-[#F71875] hover:text-[#E6006F] transition-colors"
                        >
                          <MdArrowForward />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MdEvent className="text-white text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Sua primeira festa está esperando!
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Comece criando sua primeira festa e descubra como é fácil organizar eventos incríveis.
              </p>
              <button
                onClick={() => setNewPartyModalOpen(true)}
                className="bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#9400B8] text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all duration-200 mx-auto"
              >
                <MdAdd className="text-xl" />
                Criar Primeira Festa
              </button>
            </div>
          )}
        </div>

        {/* New Party Modal */}
        <NewPartyModal
          isOpen={isNewPartyModalOpen}
          onClose={() => setNewPartyModalOpen(false)}
          onSuccess={handleCreatePartySuccess}
        />
      </ClientLayout>
    </ClientAuthGuard>
  );
} 