'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MdDashboard,
  MdCelebration,
  MdPerson,
  MdSettings,
  MdAdd,
  MdSearch,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdFilterList,
  MdEvent,
  MdTrendingUp,
  MdListAlt,
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWorkOutline,
  MdEdit,
  MdHistory,
  MdFavorite,
  MdNotifications,
  MdHelp,
  MdPrivacyTip,
  MdAccountCircle,
  MdPalette,
  MdEmail,
  MdPhone,
  MdStar,
  MdVisibility,
  MdDownload,
  MdDelete,
  MdClose
} from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { ClientOnlyGuard } from '@/components/guards/ClientOnlyGuard';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction, deleteEventAction } from '@/lib/actions/events';
import { getClientEventServicesAction } from '@/lib/actions/event-services';
import { Event, EventServiceWithDetails } from '@/types/database';
import ProfileClient from '@/components/profile/ProfileClient';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/hooks/useToast';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { AddressForm } from '@/components/profile/AddressForm';
import { PasswordForm } from '@/components/profile/PasswordForm';
import { PartyDetailsTab } from '@/components/profile/PartyDetailsTab';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'minhas-festas', label: 'Minhas Festas', icon: MdCelebration },
  { id: 'configuracoes', label: 'Configurações', icon: MdSettings }
];

// Componente Dashboard
const DashboardTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const result = await getClientEventsAction();
      if (result.success && result.data) {
        setEvents(result.data);
      }
      setLoading(false);
    };
    loadEvents();
  }, []);

  const quickLinks = [
    {
      title: 'Minhas Festas',
      description: 'Gerencie todos os seus eventos',
      icon: MdCelebration,
      href: '/perfil?tab=minhas-festas',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    },
    {
      title: 'Criar Nova Festa',
      description: 'Planeje um novo evento',
      icon: MdAdd,
      href: '/perfil?tab=minhas-festas&new=true',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
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
      title: 'Minha Conta',
      description: 'Visualize e edite suas informações',
      icon: MdPerson,
      href: '/perfil?tab=configuracoes',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Configurações',
      description: 'Ajuste suas preferências',
      icon: MdSettings,
      href: '/perfil?tab=configuracoes',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },

  ];

  // Calcular estatísticas reais
  const totalEvents = events.length;
  
  // Calcular eventos futuros (a realizar)
  const upcomingEvents = events.filter(e => 
    new Date(e.event_date) > new Date()
  ).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  
  // Calcular eventos passados (realizados)
  const pastEvents = events.filter(e => 
    new Date(e.event_date) <= new Date()
  );
  
  const nextEventDays = upcomingEvents.length > 0 
    ? Math.ceil((new Date(upcomingEvents[0].event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const stats = [
    {
      title: 'Total de Eventos',
      value: totalEvents.toString(),
      icon: MdEvent,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Eventos à Realizar',
      value: upcomingEvents.length.toString(),
      icon: MdCalendarToday,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Próximo Evento',
      value: nextEventDays > 0 ? `${nextEventDays} dias` : 'Nenhum',
      icon: MdTrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Eventos Realizados',
      value: pastEvents.length.toString(),
      icon: MdCheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  if (loading) {
    return (
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
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links Skeleton */}
        <div className="space-y-6">
          <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-28 bg-gray-300 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-1 bg-gray-200 rounded-full mt-4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-300 rounded"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 md:space-y-4">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
          Acesse rapidamente as principais funcionalidades da sua conta
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
          >
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgColor} rounded-lg md:rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-lg md:text-xl ${stat.color}`} />
              </div>
              <div className="text-center">
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-xs md:text-sm font-medium leading-tight">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
          Links Rápidos
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={link.href} className="block group">
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 h-full group-hover:transform group-hover:scale-105">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 ${link.bgColor} rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <link.icon className={`text-xl md:text-2xl ${link.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-[#F71875] transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`h-1 bg-gradient-to-r ${link.color} rounded-full mt-3 md:mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
          Atividade Recente
        </h4>
        <div className="space-y-3 md:space-y-4">
          {events.length > 0 ? (
            events
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((event, index) => {
                const daysDiff = Math.floor((new Date().getTime() - new Date(event.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const timeAgo = daysDiff === 0 ? 'Hoje' : daysDiff === 1 ? 'Ontem' : `Há ${daysDiff} dias`;
                
                return (
                  <div key={event.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MdEvent className="text-sm md:text-base text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm md:text-base">{event.title} foi criada</p>
                      <p className="text-xs md:text-sm text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-6 md:py-8 text-gray-500">
              <MdEvent className="text-3xl md:text-4xl mx-auto mb-2 text-gray-300" />
              <p className="text-sm md:text-base">Nenhuma atividade recente</p>
              <p className="text-xs md:text-sm">Crie sua primeira festa para ver as atividades aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Minhas Festas
const MinhasFestasTab = ({ onShowPartyDetails }: { onShowPartyDetails?: (eventId: string) => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventServices, setEventServices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'waiting_payment' | 'completed' | 'cancelled' | 'null'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const loadEvents = async () => {
    console.log('📥 [PROFILE] Carregando eventos do cliente...');
    setLoading(true);
    
    try {
      const [eventsResult, servicesResult] = await Promise.all([
        getClientEventsAction(),
        getClientEventServicesAction()
      ]);
      
      console.log('📋 [PROFILE] Resultado do carregamento:', eventsResult);
      
      if (eventsResult.success && eventsResult.data) {
        console.log('✅ [PROFILE] Eventos carregados com sucesso:', eventsResult.data.length, 'eventos');
        setEvents(eventsResult.data);
        
        // Contar serviços por evento
        if (servicesResult.success && servicesResult.data) {
          const serviceCount: Record<string, number> = {};
          servicesResult.data.forEach((service: EventServiceWithDetails) => {
            serviceCount[service.event_id] = (serviceCount[service.event_id] || 0) + 1;
          });
          setEventServices(serviceCount);
        }
      } else {
        console.error('❌ [PROFILE] Erro ao carregar eventos:', eventsResult.error);
        setEvents([]);
      }
    } catch (error) {
      console.error('💥 [PROFILE] Erro inesperado ao carregar eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    
    // Verificar se deve abrir o modal de nova festa
    if (searchParams.get('new') === 'true') {
      setNewPartyModalOpen(true);
      // Limpar o parâmetro da URL
      window.history.replaceState({}, '', '/perfil?tab=minhas-festas');
    }
  }, [searchParams]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all';
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    loadEvents();
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) {
      console.error('🚫 [PROFILE] Nenhum evento selecionado para exclusão');
      return;
    }

    console.log('🗑️ [PROFILE] Iniciando exclusão da festa:', {
      id: eventToDelete.id,
      title: eventToDelete.title
    });

    try {
      const result = await deleteEventAction(eventToDelete.id);
      console.log('📋 [PROFILE] Resultado da exclusão:', result);
      
      if (result.success) {
        console.log('✅ [PROFILE] Festa excluída com sucesso, recarregando lista...');
        setDeleteModalOpen(false);
        setEventToDelete(null);
        await loadEvents(); // Recarregar a lista de eventos
        toast.success('Festa excluída com sucesso!', 'A festa foi removida permanentemente.');
      } else {
        console.error('❌ [PROFILE] Erro na exclusão:', result.error);
        toast.error('Erro ao excluir festa', result.error || 'Ocorreu um erro inesperado.');
      }
    } catch (error) {
      console.error('💥 [PROFILE] Erro inesperado ao excluir evento:', error);
      toast.error('Erro ao excluir festa', 'Ocorreu um erro inesperado.');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Funções de status removidas - a coluna status não existe mais na tabela events

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const stats = [
    {
      title: 'Total de Eventos',
      value: events.length,
      icon: MdEvent,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Eventos Ativos',
      value: events.length,
      icon: MdCheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Eventos Pendentes',
      value: events.length,
      icon: MdHistory,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Eventos Realizados',
      value: events.length,
      icon: MdTrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  // Mostrar loading apenas durante o carregamento inicial dos dados
  if (loading && !events.length) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-32 bg-gray-300 rounded-xl animate-pulse"></div>
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

        {/* Search and Filter Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-300 rounded-xl"></div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="h-12 w-32 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Events Cards Skeleton */}
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-56 bg-gray-300"></div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-4 w-32 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-24 bg-gray-300 rounded-lg"></div>
                    <div className="h-8 w-32 bg-gray-300 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Minhas Festas</h2>
          <p className="text-gray-600 text-lg">
            Gerencie e acompanhe todas as suas festas em um só lugar
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setNewPartyModalOpen(true)}
          className="bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#9400B8] text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all duration-200"
        >
          <MdAdd className="text-xl" />
          Nova Festa
        </motion.button>
      </div>

      {/* Stats Cards */}
      {/* REMOVIDO: Bloco de cards de estatísticas duplicados */}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <MdFilterList className="text-gray-500 text-xl" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'waiting_payment' | 'completed' | 'cancelled' | 'null')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent outline-none transition-all duration-200 min-w-[140px]"
            >
              <option value="all">Todas</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
              <option value="waiting_payment">Aguardando Pagamento</option>
              <option value="completed">Realizada</option>
              <option value="cancelled">Cancelada</option>
              <option value="null">Sem Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
          >
            <div className="h-56 bg-gradient-to-r from-[#F71875] to-[#A502CA] relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-pink-100">
                  <MdCalendarToday className="text-lg" />
                  <span className="font-medium">{formatDate(event.event_date)}</span>
                </div>
              </div>
             
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <MdLocationOn className="text-lg text-gray-400" />
                  <span className="font-medium">{event.location || 'Local não definido'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MdPeople className="text-lg text-gray-400" />
                  <span className="font-medium">{event.guest_count} convidados</span>
                </div>
              </div>

              {event.description && (
                <p className="text-gray-600 mb-6 line-clamp-2">
                  {event.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MdWorkOutline className="text-lg" />
                  <span>{eventServices[event.id] || 0} serviços contratados</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onShowPartyDetails?.(event.id)}
                    className="bg-[#F71875] hover:bg-[#E6006F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <MdListAlt className="text-lg" />
                    Ver Detalhes
                  </button>
                  
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdEvent className="text-white text-4xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma festa encontrada' : 'Nenhuma festa criada ainda'}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
            {searchTerm || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros para encontrar suas festas.' 
              : 'Que tal começar a planejar sua primeira festa? É fácil e rápido!'
            }
          </p>
          {!(searchTerm || statusFilter !== 'all') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNewPartyModalOpen(true)}
              className="bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#9400B8] text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-3 shadow-lg shadow-pink-500/25 transition-all duration-200"
            >
              <MdAdd className="text-xl" />
              Criar Primeira Festa
            </motion.button>
          )}
        </motion.div>
      )}

      {/* New Party Modal */}
      <NewPartyModal
        isOpen={isNewPartyModalOpen}
        onClose={() => setNewPartyModalOpen(false)}
        onSuccess={handleCreatePartySuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Excluir Festa"
        message={`Tem certeza que deseja excluir a festa "${eventToDelete?.title}"? 

Esta ação não pode ser desfeita. Apenas festas em rascunho ou canceladas podem ser excluídas.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

// Componente Configurações
const ConfiguracoesTab = () => {
  const [loading, setLoading] = useState(true);
  const [activeForm, setActiveForm] = useState<'personal' | 'address' | 'password' | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Aqui você implementaria a lógica de exclusão da conta
      // Por enquanto, vamos simular um delay e mostrar uma mensagem
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Conta excluída', 'Sua conta foi excluída com sucesso.');
      await signOut();
      router.push('/');
    } catch (error) {
      toast.error('Erro ao excluir conta', 'Ocorreu um erro ao excluir sua conta. Tente novamente.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const settingsGroups = [
    {
      title: 'Conta',
      icon: MdAccountCircle,
      items: [
        { 
          id: 'personal',
          label: 'Informações Pessoais', 
          description: 'Nome, email, telefone',
          onClick: () => setActiveForm('personal')
        },
        { 
          id: 'address',
          label: 'Endereço', 
          description: 'Local padrão para eventos',
          onClick: () => setActiveForm('address')
        },
        { 
          id: 'password',
          label: 'Senha', 
          description: 'Alterar senha de acesso',
          onClick: () => setActiveForm('password')
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <div className="h-8 w-48 bg-gray-300 rounded-lg animate-pulse mx-auto"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Settings Groups Skeleton */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="p-6 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-5 w-40 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-56 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Account Actions Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="w-full p-4 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600 text-lg">
          Personalize sua experiência e gerencie suas preferências
        </p>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F71875] rounded-xl flex items-center justify-center">
                  <group.icon className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{group.title}</h3>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {item.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">
          Ações da Conta
        </h4>
        <div className="space-y-4">
          <button 
            onClick={() => setShowDeleteConfirmation(true)}
            className="w-full text-left p-4 rounded-xl hover:bg-red-50 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-600">Excluir Conta</p>
                <p className="text-sm text-gray-600">Remover permanentemente sua conta</p>
              </div>
              <div className="text-red-600">
                ⚠️
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Forms Modals */}
      <AnimatePresence>
        {activeForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-white/20 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {activeForm === 'personal' && 'Informações Pessoais'}
                    {activeForm === 'address' && 'Endereço'}
                    {activeForm === 'password' && 'Alterar Senha'}
                  </h2>
                  <button
                    onClick={() => setActiveForm(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose className="text-2xl" />
                  </button>
                </div>

                {activeForm === 'personal' && (
                  <PersonalInfoForm onClose={() => setActiveForm(null)} />
                )}

                {activeForm === 'address' && (
                  <AddressForm onClose={() => setActiveForm(null)} />
                )}

                {activeForm === 'password' && (
                  <PasswordForm onClose={() => setActiveForm(null)} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <MdDelete className="text-red-600 text-2xl" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900">
                  Excluir Conta
                </h3>
                
                <p className="text-gray-600">
                  Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos.
                </p>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? 'Excluindo...' : 'Excluir Conta'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente principal
function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
    const eventId = searchParams.get('eventId');
    
    setActiveTab(tab);
    if (eventId) {
      setSelectedEventId(eventId);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedEventId(null); // Limpar seleção de evento ao mudar de tab
    const newUrl = tabId === 'dashboard' ? '/perfil' : `/perfil?tab=${tabId}`;
    router.push(newUrl);
  };

  const handleShowPartyDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('minhas-festas');
    router.push(`/perfil?tab=minhas-festas&eventId=${eventId}`);
  };

  const handleBackToMinhasFestas = () => {
    setSelectedEventId(null);
    router.push('/perfil?tab=minhas-festas');
  };

  if (loading) {
    return (
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
          <div className="space-y-8">
            {/* Tab Navigation Skeleton */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-4 md:space-x-8 min-w-max">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="py-4 px-2 md:px-1 animate-pulse">
                    <div className="h-5 w-16 md:w-24 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Tab Content Skeleton */}
            <div className="mt-8 space-y-8">
              {/* Header Skeleton */}
              <div className="text-center space-y-4">
                <div className="h-8 w-48 bg-gray-300 rounded-lg animate-pulse mx-auto"></div>
                <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>

              {/* Cards Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-6 w-16 bg-gray-300 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'minhas-festas':
        if (selectedEventId) {
          return (
            <PartyDetailsTab 
              eventId={selectedEventId} 
              onBack={handleBackToMinhasFestas} 
            />
          );
        }
        return <MinhasFestasTab onShowPartyDetails={handleShowPartyDetails} />;
      case 'configuracoes':
        return <ConfiguracoesTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="space-y-8 px-4 md:px-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 md:space-x-8 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors duration-200 whitespace-nowrap
                      ${isActive 
                        ? 'border-[#F71875] text-[#F71875]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="text-base md:text-lg" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.id === 'dashboard' ? 'Dashboard' : 
                       tab.id === 'minhas-festas' ? 'Festas' : 
                       'Config'}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {renderTabContent()}
          </div>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
}

export default function ProfilePage() {
  return (
    <ClientOnlyGuard>
      <Suspense fallback={
        <ClientAuthGuard requiredRole="client">
          <ClientLayout>
            <div className="space-y-8">
              {/* Tab Navigation Skeleton */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex space-x-4 md:space-x-8 min-w-max">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="py-4 px-2 md:px-1 animate-pulse">
                      <div className="h-5 w-16 md:w-24 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Tab Content Skeleton */}
              <div className="mt-8 space-y-8">
                {/* Header Skeleton */}
                <div className="text-center space-y-4">
                  <div className="h-8 w-48 bg-gray-300 rounded-lg animate-pulse mx-auto"></div>
                  <div className="h-5 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="h-6 w-16 bg-gray-300 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ClientLayout>
        </ClientAuthGuard>
      }>
        <ProfilePageContent />
      </Suspense>
    </ClientOnlyGuard>
  );
}