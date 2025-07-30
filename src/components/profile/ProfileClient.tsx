"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdBusiness, 
  MdEdit, 
  MdSave, 
  MdCancel, 
  MdDelete,
  MdCelebration,
  MdCalendarToday,
  MdLocationOn,
  MdAttachMoney,
  MdPeople,
  MdTrendingUp,
  MdCheckCircle,
  MdCancel as MdCancelIcon,
  MdPending,
  MdWarning,
  MdDashboard,
  MdAdd
} from 'react-icons/md';
import { Button, Input, ConfirmationModal } from '@/components/ui';
import { updateCompleteProfileAction, deleteAccountAction } from '@/lib/actions/auth';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp_number: string | null;
  organization_name: string | null;
  cnpj: string | null;
  role: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string | null;
  status: string;
  created_at: string;
}

interface Stats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  pendingEvents: number;
  draftEvents: number;
}

interface ProfileClientProps {
  user: User;
  events: Event[];
  stats: Stats | null;
}

export default function ProfileClient({ user, events, stats }: ProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const supabase = createClient();
  const toast = useToastGlobal();

  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    whatsapp_number: user.whatsapp_number || '',
    organization_name: user.organization_name || '',
    cnpj: user.cnpj || ''
  });

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const queryString = params.toString();
    router.push(`/perfil${queryString ? `?${queryString}` : ''}`);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.full_name);
      formDataToSend.append('phone', formData.whatsapp_number);
      formDataToSend.append('organizationName', formData.organization_name);
      formDataToSend.append('cnpj', formData.cnpj);

      const result = await updateCompleteProfileAction(formDataToSend);
      
      if (result.success) {
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        
        // Toast de sucesso
        toast.success(
          'Perfil atualizado!',
          'Suas informações foram atualizadas com sucesso.',
          4000
        );
        
        router.refresh();
      } else {
        const errorMessage = result.error || 'Erro ao atualizar perfil';
        setMessage({ type: 'error', text: errorMessage });
        
        // Toast de erro
        toast.error(
          'Erro ao atualizar perfil',
          errorMessage,
          5000
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
      setMessage({ type: 'error', text: errorMessage });
      
      // Toast de erro
      toast.error(
        'Erro inesperado',
        errorMessage,
        5000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || '',
      whatsapp_number: user.whatsapp_number || '',
      organization_name: user.organization_name || '',
      cnpj: user.cnpj || ''
    });
    setIsEditing(false);
    setMessage(null);
    
    // Toast de cancelamento
    toast.info(
      'Edição cancelada',
      'As alterações foram descartadas.',
      3000
    );
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    
    try {
      const result = await deleteAccountAction();
      
      if (result.success) {
        // Toast de sucesso
        toast.success(
          'Conta excluída',
          'Sua conta foi excluída com sucesso.',
          4000
        );
        
        await supabase.auth.signOut();
        
        // Redirecionar após delay
        setTimeout(() => {
          router.push('/?message=Conta excluída com sucesso');
        }, 2000);
      } else {
        const errorMessage = result.error || 'Erro ao excluir conta';
        setMessage({ type: 'error', text: errorMessage });
        
        // Toast de erro
        toast.error(
          'Erro ao excluir conta',
          errorMessage,
          5000
        );
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const errorMessage = error.message || 'Erro ao excluir conta. Tente novamente.';
      setMessage({ type: 'error', text: errorMessage });
      
      // Toast de erro
      toast.error(
        'Erro inesperado',
        errorMessage,
        5000
      );
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MdCheckCircle className="text-green-500" />;
      case 'completed': return <MdCheckCircle className="text-blue-500" />;
      case 'cancelled': return <MdCancelIcon className="text-red-500" />;
      case 'pending': return <MdPending className="text-yellow-500" />;
      default: return <MdPending className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendente';
      case 'draft': return 'Rascunho';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#FF0080]/5 to-[#A502CA]/5 rounded-2xl shadow-sm p-8 border border-[#FF0080]/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FF0080] to-[#A502CA] rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {(user.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-[#520029] mb-1">
                      Olá, {user.full_name || 'Usuário'}! 👋
                    </h1>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FF0080]/10 text-[#FF0080]">
                      🎉 Área do Cliente
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">
                  Bem-vindo à sua área pessoal. Aqui você pode gerenciar suas festas e perfil.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-gradient-to-r from-[#FF0080]/20 to-[#A502CA]/20 rounded-2xl flex items-center justify-center">
                  <MdDashboard className="text-5xl text-[#FF0080]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total de Festas', value: stats.totalEvents, icon: MdCelebration, color: 'bg-blue-500' },
                { label: 'Festas Ativas', value: stats.activeEvents, icon: MdCheckCircle, color: 'bg-green-500' },
                { label: 'Rascunhos', value: stats.draftEvents, icon: MdPending, color: 'bg-yellow-500' },
                { label: 'Concluídas', value: stats.completedEvents, icon: MdTrendingUp, color: 'bg-purple-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-xl ${stat.color} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <stat.icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Recent Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF0080]/10 to-[#A502CA]/10 rounded-xl flex items-center justify-center">
                    <MdCelebration className="text-xl text-[#FF0080]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#520029]">Festas Recentes</h3>
                </div>
                <button
                  onClick={() => handleTabChange('events')}
                  className="px-4 py-2 bg-[#FF0080]/10 text-[#FF0080] hover:bg-[#FF0080] hover:text-white rounded-xl font-medium transition-all duration-200"
                >
                  Ver Todas
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {events.length > 0 ? (
                events
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 3)
                  .map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-[#FF0080]/10 to-[#A502CA]/10 rounded-xl flex items-center justify-center">
                            <MdCelebration className="text-xl text-[#FF0080]" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {event.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <MdCalendarToday className="mr-1" />
                                {formatDate(event.event_date)}
                              </div>
                              {event.location && (
                                <div className="flex items-center">
                                  <MdLocationOn className="mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/perfil?tab=minhas-festas&eventId=${event.id}`}
                          className="px-4 py-2 bg-[#FF0080]/10 text-[#FF0080] hover:bg-[#FF0080] hover:text-white rounded-xl font-medium transition-all duration-200"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </motion.div>
                  ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#FF0080]/10 to-[#A502CA]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MdCelebration className="text-4xl text-[#FF0080]/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Nenhuma festa criada</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Comece criando sua primeira festa e explore nossos incríveis serviços para tornar seu evento inesquecível!
                  </p>
                  <Link
                    href="/servicos"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF0080] to-[#A502CA] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                  >
                    <MdCelebration className="text-xl" />
                    <span>Explorar Serviços</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FF0080]/10 to-[#A502CA]/10 rounded-xl flex items-center justify-center">
                  <MdCelebration className="text-2xl text-[#FF0080]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#520029]">Todas as Minhas Festas</h3>
                  <p className="text-gray-500">Gerencie todos os seus eventos</p>
                </div>
              </div>
              <Link
                href="/servicos"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF0080] to-[#A502CA] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <MdAdd className="text-lg" />
                <span>Explorar Serviços</span>
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {events.length > 0 ? (
              events
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#FF0080]/10 to-[#A502CA]/10 rounded-xl flex items-center justify-center">
                          <MdCelebration className="text-xl text-[#FF0080]" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MdCalendarToday className="mr-1" />
                              {formatDate(event.event_date)}
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MdLocationOn className="mr-1" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/perfil?tab=minhas-festas&eventId=${event.id}`}
                        className="px-4 py-2 bg-[#FF0080]/10 text-[#FF0080] hover:bg-[#FF0080] hover:text-white rounded-xl font-medium transition-all duration-200"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#FF0080]/10 to-[#A502CA]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MdCelebration className="text-4xl text-[#FF0080]/50" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">Nenhuma festa criada</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Comece criando sua primeira festa e explore nossos incríveis serviços para tornar seu evento inesquecível!
                </p>
                <Link
                  href="/servicos"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF0080] to-[#A502CA] text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                >
                  <MdCelebration className="text-xl" />
                  <span>Explorar Serviços</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#520029]">Informações Pessoais</h3>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  variant="secondary"
                >
                  <MdEdit />
                  <span>Editar</span>
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                {isEditing ? (
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MdPerson className="text-gray-400" />
                    <span>{user.full_name || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MdEmail className="text-gray-400" />
                  <span className="text-gray-500">••••••••@••••••••</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone/WhatsApp</label>
                {isEditing ? (
                  <Input
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MdPhone className="text-gray-400" />
                    <span>{user.whatsapp_number || 'Não informado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa/Organização</label>
                {isEditing ? (
                  <Input
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                ) : (
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <MdBusiness className="text-gray-400" />
                    <span>{user.organization_name || 'Não informado'}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <MdSave />
                  <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="flex items-center space-x-2"
                >
                  <MdCancel />
                  <span>Cancelar</span>
                </Button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Zona de Perigo</h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Excluir sua conta é uma ação permanente e não pode ser desfeita. 
                Todos os seus dados serão removidos permanentemente.
              </p>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="secondary"
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <MdDelete />
                <span>Excluir Conta</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Excluir Conta"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos permanentemente."
        confirmLabel="Sim, excluir conta"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        confirmVariant="danger"
      />
    </div>
  );
} 