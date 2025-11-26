'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdBusiness,
  MdEmail,
  MdPhone,
  MdStar,
  MdRefresh,
  MdError,
  MdTrendingUp,
  MdVerifiedUser,
  MdAttachMoney,
  MdDelete,
  MdWarning
} from 'react-icons/md';
import { SearchInput } from '@/components/admin/SearchInput';
import { getAllUsersAction, deleteProviderAction } from '@/lib/actions/admin';

interface ProviderData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  organization_name?: string;
  whatsapp_number?: string;
  servicesCount?: number;
  totalRevenue?: number;
}

export default function PrestadoresPage() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<ProviderData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDeleteProvider = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const result = await deleteProviderAction(deleteConfirm.id);

      if (result.success) {
        // Remove do estado
        setProviders(providers.filter(p => p.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        setError(result.error || 'Erro ao deletar prestador');
      }
    } catch (err) {
      console.error('Erro ao deletar prestador:', err);
      setError('Erro ao deletar prestador');
    } finally {
      setDeleting(false);
    }
  };

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando carregamento de prestadores...');
      
      // Primeiro, tentar carregar apenas usuários
      const usersResult = await getAllUsersAction();
      console.log('Resultado da busca de usuários:', usersResult);
      
      if (usersResult.success && usersResult.data) {
        // Filtrar apenas prestadores
        const providerUsers = usersResult.data.filter(user => user.role === 'provider');
        console.log(`Encontrados ${providerUsers.length} prestadores`);
        
        // Enriquecer com dados padrão (servicesCount será 0)
        const enrichedProviders = providerUsers.map(provider => ({
          ...provider,
          servicesCount: 0,
          totalRevenue: 0
        }));
        
        setProviders(enrichedProviders);
        setFilteredProviders(enrichedProviders);
      } else {
        setError(usersResult.error || 'Erro ao carregar prestadores');
      }
    } catch (err) {
      console.error('Erro ao carregar prestadores:', err);
      setError('Erro ao carregar lista de prestadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter(provider =>
        provider.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (provider.organization_name && provider.organization_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProviders(filtered);
    }
  }, [searchTerm, providers]);

  const stats = {
    totalProviders: providers.length,
    newProvidersThisMonth: providers.filter(provider => {
      const providerDate = new Date(provider.created_at);
      const currentDate = new Date();
      return providerDate.getMonth() === currentDate.getMonth() && 
             providerDate.getFullYear() === currentDate.getFullYear();
    }).length,
    activeProviders: providers.filter(provider => provider.servicesCount && provider.servicesCount > 0).length,
    totalServices: providers.reduce((sum, provider) => sum + (provider.servicesCount || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando prestadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MdError className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar prestadores</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProviders}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-title">Prestadores</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie todos os prestadores de serviços da plataforma
          </p>
        </div>
        <button
          onClick={loadProviders}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base disabled:opacity-50"
        >
          <MdRefresh className={`text-base sm:text-lg ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total de Prestadores</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProviders}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <MdBusiness className="text-2xl text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Novos este Mês</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.newProvidersThisMonth}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <MdTrendingUp className="text-2xl text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Prestadores Ativos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeProviders}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <MdVerifiedUser className="text-2xl text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total de Serviços</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalServices}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <MdAttachMoney className="text-2xl text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar prestadores por nome, empresa ou email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>
      </motion.div>

      {/* Providers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-title">
            Lista de Prestadores ({filteredProviders.length})
          </h2>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="p-8 text-center">
            <MdBusiness className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum prestador encontrado para sua busca' : 'Nenhum prestador cadastrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">Prestador</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden sm:table-cell">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden lg:table-cell">WhatsApp</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden lg:table-cell">Serviços</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden lg:table-cell">Data Cadastro</th>
                  <th className="text-center p-4 font-medium text-gray-600 text-sm w-16">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProviders.map((provider, index) => (
                  <motion.tr
                    key={provider.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                          {((provider.organization_name || provider.full_name) || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {provider.organization_name || provider.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {provider.organization_name ? provider.full_name : provider.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <MdEmail className="text-gray-400" />
                        <span className="text-sm text-gray-600">{provider.email}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <MdPhone className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {provider.whatsapp_number || 'Não informado'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">
                        {provider.servicesCount || 0} serviços
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">
                        {formatDate(provider.created_at)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setDeleteConfirm(provider)}
                        className="inline-flex items-center justify-center p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors font-bold"
                        title="Deletar prestador"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden"
            >
              {/* Header with warning */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <MdWarning className="text-3xl" />
                  <h2 className="text-xl font-bold">Deletar Prestador</h2>
                </div>
                <p className="text-red-100 text-sm">Esta ação é irreversível</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Tem certeza que deseja deletar o prestador{' '}
                  <span className="font-bold text-gray-900">
                    {deleteConfirm.organization_name || deleteConfirm.full_name || 'desconhecido'}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Email: <span className="text-gray-700">{deleteConfirm.email}</span>
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    ⚠️ Todos os serviços e dados associados a este prestador também serão deletados.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 p-6 flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteProvider}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deletando...
                    </>
                  ) : (
                    <>
                      <MdDelete />
                      Deletar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 