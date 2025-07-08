'use client';

import { motion } from 'framer-motion';
import { MdBusinessCenter, MdEmail, MdPhone, MdStar, MdCheckCircle, MdCancel } from 'react-icons/md';
import { Provider } from '@/types/admin';

// Mock data para demonstração
const mockProviders: Provider[] = [
  {
    id: 'PRO-001',
    businessName: 'Barreto\'s Buffet',
    email: 'contato@barretosbuffet.com',
    phone: '(11) 99999-9999',
    cnpj: '12.345.678/0001-90',
    category: 'Buffet',
    rating: 4.8,
    totalServices: 25,
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'PRO-002',
    businessName: 'DJ Mix',
    email: 'contato@djmix.com',
    phone: '(11) 88888-8888',
    cnpj: '98.765.432/0001-10',
    category: 'Música',
    rating: 4.5,
    totalServices: 18,
    isActive: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'PRO-003',
    businessName: 'Flores & Cia',
    email: 'contato@floresecia.com',
    phone: '(11) 77777-7777',
    cnpj: '45.678.912/0001-34',
    category: 'Decoração',
    rating: 4.9,
    totalServices: 32,
    isActive: false,
    createdAt: new Date('2024-01-05')
  }
];

export default function AdminProviders() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? MdCheckCircle : MdCancel;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-title">Prestadores</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Gerencie todos os prestadores de serviços
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Total de Prestadores</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{mockProviders.length}</p>
            </div>
            <div className="bg-primary-light p-2 md:p-3 rounded-lg mt-2 md:mt-0 self-end md:self-auto">
              <MdBusinessCenter className="text-base md:text-2xl text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Ativos</p>
              <p className="text-lg md:text-2xl font-bold text-green-600 mt-1">
                {mockProviders.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="bg-green-100 p-2 md:p-3 rounded-lg mt-2 md:mt-0 self-end md:self-auto">
              <MdCheckCircle className="text-base md:text-2xl text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Avaliação Média</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-600 mt-1">
                {(mockProviders.reduce((acc, p) => acc + p.rating, 0) / mockProviders.length).toFixed(1)}
              </p>
            </div>
            <div className="bg-yellow-100 p-2 md:p-3 rounded-lg mt-2 md:mt-0 self-end md:self-auto">
              <MdStar className="text-base md:text-2xl text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl p-3 md:p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs md:text-sm font-medium">Total de Serviços</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">
                {mockProviders.reduce((acc, p) => acc + p.totalServices, 0)}
              </p>
            </div>
            <div className="bg-primary-light p-2 md:p-3 rounded-lg mt-2 md:mt-0 self-end md:self-auto">
              <MdBusinessCenter className="text-base md:text-2xl text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {mockProviders.map((provider, index) => {
          const StatusIcon = getStatusIcon(provider.isActive);
          
          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-lg">
                    {provider.businessName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{provider.businessName}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{provider.category}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MdEmail className="text-base sm:text-lg flex-shrink-0" />
                  <span className="truncate">{provider.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdPhone className="text-base sm:text-lg flex-shrink-0" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdStar className="text-yellow-500 flex-shrink-0" />
                  <span>{provider.rating}/5</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-base sm:text-lg font-semibold text-primary">
                  {provider.totalServices} serviços
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`text-base sm:text-lg ${getStatusColor(provider.isActive)}`} />
                  <span className={`text-xs sm:text-sm font-medium ${getStatusColor(provider.isActive)}`}>
                    {provider.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(provider.createdAt)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 