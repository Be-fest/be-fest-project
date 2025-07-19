'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  MdDelete
} from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction, deleteEventAction } from '@/lib/actions/events';
import { getEventServicesAction } from '@/lib/actions/event-services';
import { Event, EventStatus } from '@/types/database';
import ProfileClient from '@/components/profile/ProfileClient';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/hooks/useToast';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';

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
  const [loading, setLoading] = useState(false); // Changed from true to false

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(false); // Keep loading state false to prevent UI flicker
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
  const activeEvents = events.filter(e => e.status === 'published').length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const totalEvents = events.length;
  
  // Calcular próximo evento
  const upcomingEvents = events.filter(e => 
    e.status === 'published' && new Date(e.event_date) > new Date()
  ).sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  
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
      title: 'Eventos Ativos',
      value: activeEvents.toString(),
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
      value: completedEvents.toString(),
      icon: MdCheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 text-lg">
          Acesse rapidamente as principais funcionalidades da sua conta
        </p>
      </div>

      {/* Quick Stats */}
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
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 text-center">
          Links Rápidos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={link.href} className="block group">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 h-full group-hover:transform group-hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 ${link.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <link.icon className={`text-2xl ${link.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#F71875] transition-colors">
                        {link.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {link.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`h-1 bg-gradient-to-r ${link.color} rounded-full mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">
          Atividade Recente
        </h4>
        <div className="space-y-4">
          {events.length > 0 ? (
            events
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((event, index) => {
                const daysDiff = Math.floor((new Date().getTime() - new Date(event.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const timeAgo = daysDiff === 0 ? 'Hoje' : daysDiff === 1 ? 'Ontem' : `Há ${daysDiff} dias`;
                
                return (
                  <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MdEvent className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title} foi criada</p>
                      <p className="text-sm text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MdEvent className="text-4xl mx-auto mb-2 text-gray-300" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">Crie sua primeira festa para ver as atividades aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Minhas Festas
const MinhasFestasTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventServices, setEventServices] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'waiting_payment' | 'completed' | 'cancelled' | 'null'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const loadEvents = async () => {
    console.log('📥 [PROFILE] Carregando eventos do cliente...');
    setLoading(false); // Keep loading state false to prevent UI flicker
    
    try {
      const result = await getClientEventsAction();
      console.log('📋 [PROFILE] Resultado do carregamento:', result);
      
      if (result.success && result.data) {
        console.log('✅ [PROFILE] Eventos carregados com sucesso:', result.data.length, 'eventos');
        setEvents(result.data);
        
        // Carregar serviços para cada evento
        const servicesData: Record<string, any[]> = {};
        for (const event of result.data) {
          try {
            const servicesResult = await getEventServicesAction({ event_id: event.id });
            if (servicesResult.success && servicesResult.data) {
              servicesData[event.id] = servicesResult.data;
            } else {
              servicesData[event.id] = [];
            }
          } catch (error) {
            console.error(`❌ [PROFILE] Erro ao carregar serviços do evento ${event.id}:`, error);
            servicesData[event.id] = [];
          }
        }
        setEventServices(servicesData);
      } else {
        console.error('❌ [PROFILE] Erro ao carregar eventos:', result.error);
        setEvents([]);
        setLoading(false);
        setEventServices({});
      }
    } catch (error) {
      console.error('💥 [PROFILE] Erro inesperado ao carregar eventos:', error);
      setEvents([]);
      setLoading(false);
      setEventServices({});
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
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'null' && event.status === null) ||
      (statusFilter !== 'null' && event.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    loadEvents(); // Isso já recarregará tanto os eventos quanto os serviços
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
      title: eventToDelete.title,
      status: eventToDelete.status
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

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case null:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return <MdEdit className="text-gray-600" />;
      case 'published':
        return <MdCheckCircle className="text-green-600" />;
      case 'waiting_payment':
        return <MdError className="text-yellow-600" />;
      case 'completed':
        return <MdCheckCircle className="text-blue-600" />;
      case 'cancelled':
        return <MdError className="text-red-600" />;
      case null:
        return <MdInfo className="text-gray-600" />;
      default:
        return <MdInfo className="text-gray-600" />;
    }
  };

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
      title: 'Publicadas',
      value: events.filter(e => e.status === 'published').length,
      icon: MdCheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Aguardando Pagamento',
      value: events.filter(e => e.status === 'waiting_payment').length,
      icon: MdHistory,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Realizadas',
      value: events.filter(e => e.status === 'completed').length,
      icon: MdTrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

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
              <div className="absolute top-4 right-4">
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
                  <span>{(eventServices[event.id] || []).length} serviços contratados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/minhas-festas/${event.id}`}
                    className="bg-[#F71875] hover:bg-[#E6006F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <MdListAlt className="text-lg" />
                    Ver Detalhes
                  </Link>
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
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [modals, setModals] = useState({
    editProfile: false,
    changePassword: false,
    deleteAccount: false
  });
  const { userData } = useAuth();

  useEffect(() => {
    // Removed the simulated loading timer
    setLoading(false);
  }, []);

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const settingsGroups = [
    {
      title: 'Conta',
      icon: MdAccountCircle,
      items: [
        { 
          label: 'Informações Pessoais', 
          description: 'Nome, email, telefone',
          onClick: () => openModal('editProfile')
        },
        { 
          label: 'Senha', 
          description: 'Alterar senha de acesso',
          onClick: () => openModal('changePassword')
        }
      ]
    }
  ];

  const handleProfileUpdateSuccess = () => {
    // A página será revalidada automaticamente pelo action
    window.location.reload();
  };

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
              {group.items.map((item, itemIndex) => (
                <div
                  key={item.label}
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
            onClick={() => openModal('deleteAccount')}
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

      {/* Modals */}
      <EditProfileModal
        isOpen={modals.editProfile}
        onClose={() => closeModal('editProfile')}
        userData={userData || {}}
        onSuccess={handleProfileUpdateSuccess}
      />

      <ChangePasswordModal
        isOpen={modals.changePassword}
        onClose={() => closeModal('changePassword')}
      />

      <DeleteAccountModal
        isOpen={modals.deleteAccount}
        onClose={() => closeModal('deleteAccount')}
        userName={userData?.full_name || userData?.organization_name || 'usuário'}
      />
    </div>
  );
};

// Componente principal
function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userData, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const newUrl = tabId === 'dashboard' ? '/perfil' : `/perfil?tab=${tabId}`;
    router.push(newUrl);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'minhas-festas':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <MinhasFestasTab />
          </Suspense>
        );
      case 'configuracoes':
        return <ConfiguracoesTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                      ${isActive 
                        ? 'border-[#F71875] text-[#F71875]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="text-lg" />
                    {tab.label}
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
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}