'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MdPeople, 
  MdEmail, 
  MdPhone, 
  MdSearch,
  MdRefresh,
  MdError,
  MdTrendingUp,
  MdEvent,
  MdAttachMoney
} from 'react-icons/md';
import { SearchInput } from '@/components/admin/SearchInput';
import { getAllUsersAction } from '@/lib/actions/admin';

interface ClientData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  whatsapp_number?: string;
  totalEvents?: number;
  totalSpent?: number;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllUsersAction();
      
      if (result.success && result.data) {
        // Filtrar apenas clientes
        const clientUsers = result.data.filter(user => user.role === 'client');
        setClients(clientUsers);
        setFilteredClients(clientUsers);
      } else {
        setError(result.error || 'Erro ao carregar clientes');
      }
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const stats = {
    totalClients: clients.length,
    newClientsThisMonth: clients.filter(client => {
      const clientDate = new Date(client.created_at);
      const currentDate = new Date();
      return clientDate.getMonth() === currentDate.getMonth() && 
             clientDate.getFullYear() === currentDate.getFullYear();
    }).length,
    averageEventsPerClient: 0, // Implementar quando tiver dados de eventos
    totalRevenue: 0 // Implementar quando tiver dados de faturamento
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MdError className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar clientes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadClients}
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
          <h1 className="text-2xl sm:text-3xl font-bold text-title">Clientes</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Gerencie todos os clientes da plataforma
          </p>
        </div>
        <button
          onClick={loadClients}
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
              <p className="text-gray-600 text-sm font-medium">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalClients}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <MdPeople className="text-2xl text-blue-600" />
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.newClientsThisMonth}</p>
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
              <p className="text-gray-600 text-sm font-medium">Média Eventos/Cliente</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageEventsPerClient}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <MdEvent className="text-2xl text-purple-600" />
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
              <p className="text-gray-600 text-sm font-medium">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalRevenue)}</p>
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
              placeholder="Buscar clientes por nome ou email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
        </div>
      </motion.div>

      {/* Clients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-title">
            Lista de Clientes ({filteredClients.length})
          </h2>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <MdPeople className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum cliente encontrado para sua busca' : 'Nenhum cliente cadastrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm">Cliente</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden sm:table-cell">Email</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden lg:table-cell">WhatsApp</th>
                  <th className="text-left p-4 font-medium text-gray-600 text-sm hidden lg:table-cell">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-medium">
                          {client.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{client.full_name}</p>
                          <p className="text-sm text-gray-500 sm:hidden">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <MdEmail className="text-gray-400" />
                        <span className="text-sm text-gray-600">{client.email}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <MdPhone className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {client.whatsapp_number || 'Não informado'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">
                        {formatDate(client.created_at)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
} 