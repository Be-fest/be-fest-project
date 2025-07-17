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
  MdDelete,
  MdGroup
} from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { NewPartyModal } from '@/components/NewPartyModal';
import { getClientEventsAction, deleteEventAction } from '@/lib/actions/events';
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

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 border-green-200 text-green-800';
    case 'draft':
      return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 border-blue-200 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 border-red-200 text-red-800';
    case 'waiting_payment':
      return 'bg-orange-100 border-orange-200 text-orange-800';
    default:
      return 'bg-gray-100 border-gray-200 text-gray-800';
  }
};

const getStatusIcon = (status: EventStatus) => {
  switch (status) {
    case 'published':
      return <MdCheckCircle className="text-green-500" />;
    case 'draft':
      return <MdEdit className="text-yellow-500" />;
    case 'completed':
      return <MdCheckCircle className="text-blue-500" />;
    case 'cancelled':
      return <MdError className="text-red-500" />;
    case 'waiting_payment':
      return <MdInfo className="text-orange-500" />;
    default:
      return <MdInfo className="text-gray-500" />;
  }
};

const getStatusLabel = (status: EventStatus) => {
  switch (status) {
    case 'published':
      return 'Publicada';
    case 'draft':
      return 'Rascunho';
    case 'completed':
      return 'Concluída';
    case 'cancelled':
      return 'Cancelada';
    case 'waiting_payment':
      return 'Aguardando Pagamento';
    default:
      return 'Desconhecido';
  }
};

// Componente Dashboard
const DashboardTab = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const result = await getClientEventsAction();
      if (result.success && result.data) {
        setEvents(result.data);
      }
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
      icon: MdWorkOutline,
      href: '/prestadores',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Configurações',
      description: 'Gerencie sua conta',
      icon: MdSettings,
      href: '/perfil?tab=configuracoes',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600'
    }
  ];

  const stats = [
    {
      title: 'Total de Festas',
      value: events.length,
      icon: MdCelebration,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Festas Publicadas',
      value: events.filter(e => e.status === 'published').length,
      icon: MdCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rascunhos',
      value: events.filter(e => e.status === 'draft').length,
      icon: MdEdit,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Festas Concluídas',
      value: events.filter(e => e.status === 'completed').length,
      icon: MdTrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao seu Dashboard!</h1>
        <p className="text-purple-100 text-lg">Gerencie suas festas e acompanhe tudo em um só lugar.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => (
          <Link key={link.title} href={link.href}>
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${link.bgColor}`}>
                  <link.icon className={`text-xl ${link.textColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Eventos Recentes</h2>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <MdCelebration className="text-4xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum evento criado ainda</p>
            <Link href="/perfil?tab=minhas-festas&new=true">
              <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Criar Primeira Festa
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(event.event_date)}</p>
                  </div>
                </div>
                <Link href={`/minhas-festas/${event.id}`}>
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Ver Detalhes
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Minhas Festas
const MinhasFestasTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadEvents = async () => {
      const result = await getClientEventsAction();
      if (result.success && result.data) {
        setEvents(result.data);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = (newEvent: Event) => {
    setEvents(prev => [...prev, newEvent]);
    setNewPartyModalOpen(false);
    showToast('Festa criada com sucesso!', 'success');
  };

  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    const result = await deleteEventAction(eventToDelete.id);
    if (result.success) {
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      showToast('Festa excluída com sucesso!', 'success');
    } else {
      showToast('Erro ao excluir festa', 'error');
    }
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const stats = [
    {
      title: 'Total de Festas',
      value: events.length,
      icon: MdCelebration,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Festas Publicadas',
      value: events.filter(e => e.status === 'published').length,
      icon: MdCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rascunhos',
      value: events.filter(e => e.status === 'draft').length,
      icon: MdEdit,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Festas Concluídas',
      value: events.filter(e => e.status === 'completed').length,
      icon: MdTrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Festas</h1>
          <p className="text-gray-600">Gerencie todos os seus eventos</p>
        </div>
        <button
          onClick={() => setNewPartyModalOpen(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <MdAdd className="text-xl" />
          Nova Festa
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar festas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | EventStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos os Status</option>
              <option value="draft">Rascunhos</option>
              <option value="published">Publicadas</option>
              <option value="waiting_payment">Aguardando Pagamento</option>
              <option value="completed">Concluídas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="grid gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="h-48 bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] flex items-center justify-center">
              <div className="text-white text-center">
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-purple-100 mt-1">
                  {formatDate(event.event_date)}
                </p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MdGroup className="text-gray-400" />
                  <span className="text-sm text-gray-600">{event.guest_count} convidados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.status === 'published' ? 'bg-green-100 text-green-800' :
                    event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdLocationOn className="text-gray-400" />
                  <span className="text-sm text-gray-600">{event.location || 'Local não definido'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/minhas-festas/${event.id}`}>
                    <button className="px-4 py-2 text-[#A502CA] hover:bg-purple-50 rounded-lg transition-colors">
                      Ver Detalhes
                    </button>
                  </Link>
                  {(event.status === 'draft' || event.status === 'cancelled') && (
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <MdCelebration className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma festa encontrada' : 'Nenhuma festa criada ainda'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros para encontrar suas festas.'
              : 'Comece criando sua primeira festa e convide seus amigos!'}
          </p>
          {!(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => setNewPartyModalOpen(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Criar Primeira Festa
            </button>
          )}
        </div>
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
  const [modals, setModals] = useState({
    editProfile: false,
    changePassword: false,
    deleteAccount: false
  });
  const { userData } = useAuth();

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const settingsGroups = [
    {
      title: 'Conta',
      items: [
        {
          icon: MdAccountCircle,
          title: 'Editar Perfil',
          description: 'Atualize suas informações pessoais',
          action: () => openModal('editProfile')
        },
        {
          icon: MdPrivacyTip,
          title: 'Alterar Senha',
          description: 'Mantenha sua conta segura',
          action: () => openModal('changePassword')
        }
      ]
    },
    {
      title: 'Preferências',
      items: [
        {
          icon: MdNotifications,
          title: 'Notificações',
          description: 'Gerencie suas notificações',
          action: () => {}
        },
        {
          icon: MdPalette,
          title: 'Aparência',
          description: 'Personalize a interface',
          action: () => {}
        }
      ]
    },
    {
      title: 'Suporte',
      items: [
        {
          icon: MdHelp,
          title: 'Central de Ajuda',
          description: 'Encontre respostas para suas dúvidas',
          action: () => {}
        },
        {
          icon: MdEmail,
          title: 'Fale Conosco',
          description: 'Entre em contato com nossa equipe',
          action: () => {}
        }
      ]
    },
    {
      title: 'Zona de Perigo',
      items: [
        {
          icon: MdDelete,
          title: 'Excluir Conta',
          description: 'Remova permanentemente sua conta',
          action: () => openModal('deleteAccount'),
          danger: true
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas configurações e preferências</p>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{userData?.name}</h3>
            <p className="text-gray-600">{userData?.email}</p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      {settingsGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{group.title}</h2>
          <div className="space-y-3">
            {group.items.map((item) => (
              <button
                key={item.title}
                onClick={item.action}
                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  item.danger 
                    ? 'hover:bg-red-50 border border-red-200' 
                    : 'hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  item.danger ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <item.icon className={`text-xl ${
                    item.danger ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-medium ${
                    item.danger ? 'text-red-900' : 'text-gray-900'
                  }`}>{item.title}</h3>
                  <p className={`text-sm ${
                    item.danger ? 'text-red-600' : 'text-gray-600'
                  }`}>{item.description}</p>
                </div>
                <div className="text-gray-400">
                  <MdEdit className="text-lg" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Modals */}
      <EditProfileModal
        isOpen={modals.editProfile}
        onClose={() => closeModal('editProfile')}
      />
      <ChangePasswordModal
        isOpen={modals.changePassword}
        onClose={() => closeModal('changePassword')}
      />
      <DeleteAccountModal
        isOpen={modals.deleteAccount}
        onClose={() => closeModal('deleteAccount')}
      />
    </div>
  );
};

// Componente Principal
const PerfilPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/perfil?tab=${tabId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'minhas-festas':
        return <MinhasFestasTab />;
      case 'configuracoes':
        return <ConfiguracoesTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <ClientAuthGuard>
      <ClientLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-8">
              <nav className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="text-xl" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
};

const PerfilPageWithSuspense = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>}>
      <PerfilPage />
    </Suspense>
  );
};

export default PerfilPageWithSuspense;
