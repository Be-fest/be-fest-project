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
  MdDownload
} from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction, deleteEventAction } from '@/lib/actions/events';
import { Event, EventStatus } from '@/types/database';
import ProfileClient from '@/components/profile/ProfileClient';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'minhas-festas', label: 'Minhas Festas', icon: MdCelebration },
  { id: 'perfil', label: 'Perfil', icon: MdPerson },
  { id: 'configuracoes', label: 'Configurações', icon: MdSettings }
];

// Componente Dashboard
const DashboardTab = () => {
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
      title: 'Meu Perfil',
      description: 'Visualize e edite suas informações',
      icon: MdPerson,
      href: '/perfil',
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
    {
      title: 'Histórico',
      description: 'Veja seus eventos anteriores',
      icon: MdHistory,
      href: '/perfil?tab=historico',
      color: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    }
  ];

  const stats = [
    {
      title: 'Eventos Ativos',
      value: '3',
      icon: MdEvent,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Próximo Evento',
      value: '15 dias',
      icon: MdCalendarToday,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Prestadores Favoritos',
      value: '8',
      icon: MdFavorite,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Eventos Realizados',
      value: '12',
      icon: MdTrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <MdEvent className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Festa de Aniversário criada</p>
              <p className="text-sm text-gray-500">Há 2 dias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MdFavorite className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Prestador adicionado aos favoritos</p>
              <p className="text-sm text-gray-500">Há 3 dias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MdSearch className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Serviços de buffet pesquisados</p>
              <p className="text-sm text-gray-500">Há 5 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Minhas Festas
const MinhasFestasTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const searchParams = useSearchParams();

  const loadEvents = async () => {
    setLoading(true);
    const result = await getClientEventsAction();
    if (result.success && result.data) {
      setEvents(result.data);
    } else {
      console.error('Erro ao carregar eventos:', result.error);
    }
    setLoading(false);
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
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    loadEvents();
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
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
      case 'completed':
        return <MdCheckCircle className="text-blue-600" />;
      case 'cancelled':
        return <MdError className="text-red-600" />;
      default:
        return <MdInfo className="text-gray-600" />;
    }
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'published':
        return 'Publicada';
      case 'completed':
        return 'Realizada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
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
      title: 'Realizadas',
      value: events.filter(e => e.status === 'completed').length,
      icon: MdTrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-300 rounded-lg animate-pulse"></div>
          <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F71875] focus:border-transparent outline-none transition-all duration-200 min-w-[140px]"
            >
              <option value="all">Todas</option>
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
              <option value="completed">Realizada</option>
              <option value="cancelled">Cancelada</option>
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
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
                  {getStatusIcon(event.status)}
                  {getStatusLabel(event.status)}
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
                  <span>0 serviços contratados</span>
                </div>
                <Link
                  href={`/minhas-festas/${event.id}`}
                  className="bg-[#F71875] hover:bg-[#E6006F] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MdListAlt className="text-lg" />
                  Ver Detalhes
                </Link>
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
    </div>
  );
};

// Componente Configurações
const ConfiguracoesTab = () => {
  const settingsGroups = [
    {
      title: 'Conta',
      icon: MdAccountCircle,
      items: [
        { label: 'Informações Pessoais', description: 'Nome, email, telefone' },
        { label: 'Endereço', description: 'Local padrão para eventos' },
        { label: 'Senha', description: 'Alterar senha de acesso' }
      ]
    },
    {
      title: 'Notificações',
      icon: MdNotifications,
      items: [
        { label: 'Email', description: 'Notificações por email' },
        { label: 'Push', description: 'Notificações no navegador' },
        { label: 'SMS', description: 'Notificações por SMS' }
      ]
    },
    {
      title: 'Privacidade',
      icon: MdPrivacyTip,
      items: [
        { label: 'Perfil Público', description: 'Visibilidade do seu perfil' },
        { label: 'Dados Pessoais', description: 'Controle de dados' },
        { label: 'Histórico', description: 'Gerenciar histórico de eventos' }
      ]
    },
    {
      title: 'Preferências',
      icon: MdPalette,
      items: [
        { label: 'Tema', description: 'Aparência da interface' },
        { label: 'Idioma', description: 'Idioma da plataforma' },
        { label: 'Região', description: 'Localização e moeda' }
      ]
    }
  ];

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
          <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Exportar Dados</p>
                <p className="text-sm text-gray-600">Baixar uma cópia dos seus dados</p>
              </div>
              <div className="text-blue-600">
                ↓
              </div>
            </div>
          </button>
          
          <button className="w-full text-left p-4 rounded-xl hover:bg-red-50 transition-colors duration-200">
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
    </div>
  );
};

// Componente principal
function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, userData, loading } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F71875] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'minhas-festas':
        return <MinhasFestasTab />;
      case 'perfil':
        return user && userData ? (
          <ProfileClient 
            user={{
              id: user.id,
              full_name: userData.full_name,
              email: user.email || null,
              whatsapp_number: null,
              organization_name: userData.organization_name,
              cnpj: null,
              role: userData.role
            }}
            events={[]}
            stats={null}
          />
        ) : null;
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
    <Suspense fallback={<div>Carregando...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
} 