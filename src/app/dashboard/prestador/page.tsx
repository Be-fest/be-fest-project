'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdDashboard, MdAdd, MdBusiness, MdBarChart, MdNotifications, MdArrowBack } from 'react-icons/md';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { ServiceManagement } from '@/components/dashboard/ServiceManagement';
import { ProviderStats } from '@/components/dashboard/ProviderStats';
import { OrderRequests } from '@/components/dashboard/OrderRequests';
import { ProviderProfile } from '@/components/dashboard/ProviderProfile';
import { ServiceFormModal } from '@/components/dashboard/ServiceFormModal';
import Link from 'next/link';

type TabType = 'overview' | 'services' | 'orders' | 'profile';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);

  const handleOpenServiceModal = () => setServiceModalOpen(true);
  const handleCloseServiceModal = () => setServiceModalOpen(false);
  const handleServiceSubmit = (data: any) => {
    // Aqui você pode adicionar lógica para salvar o serviço
    setServiceModalOpen(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'addService':
        setServiceModalOpen(true);
        break;
      case 'viewOrders':
        setActiveTab('orders');
        break;
      case 'updateProfile':
        setActiveTab('profile');
        break;
      case 'viewReports':
        // Aqui você pode implementar navegação para relatórios
        break;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: MdDashboard },
    { id: 'services', label: 'Meus Serviços', icon: MdBusiness },
    { id: 'orders', label: 'Solicitações', icon: MdNotifications },
    { id: 'profile', label: 'Perfil', icon: MdBarChart },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProviderStats onQuickAction={handleQuickAction} />;
      case 'services':
        return <ServiceManagement />;
      case 'orders':
        return <OrderRequests />;
      case 'profile':
        return <ProviderProfile />;
      default:
        return <ProviderStats onQuickAction={handleQuickAction} />;
    }
  };

  return (
    <ProviderLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MdArrowBack className="text-xl sm:text-2xl text-[#A502CA]" />
                </Link>
                <h1 className="text-lg sm:text-2xl font-bold text-[#520029]">Dashboard do Prestador</h1>
              </div>
              <button
                className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                onClick={handleOpenServiceModal}
              >
                <MdAdd className="text-lg" />
                <span className="hidden sm:inline">Novo Serviço</span>
                <span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-1 sm:gap-2 py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#A502CA] text-[#A502CA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="text-base sm:text-lg" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>

        {/* Service Form Modal */}
        <ServiceFormModal
          isOpen={isServiceModalOpen}
          onClose={handleCloseServiceModal}
          onSubmit={handleServiceSubmit}
        />
      </div>
    </ProviderLayout>
  );
}
