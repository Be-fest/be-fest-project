'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdDashboard, MdBusiness, MdBarChart, MdNotifications } from 'react-icons/md';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { ServiceManagement } from '@/components/dashboard/ServiceManagement';
import { ProviderStats } from '@/components/dashboard/ProviderStats';
import { OrderRequests } from '@/components/dashboard/OrderRequests';
import { ProviderProfile } from '@/components/dashboard/ProviderProfile';
import { ServiceFormModal } from '@/components/dashboard/ServiceFormModal';

type TabType = 'overview' | 'services' | 'orders' | 'profile';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);

  const handleOpenServiceModal = () => setServiceModalOpen(true);
  const handleCloseServiceModal = () => setServiceModalOpen(false);
  const handleServiceSubmit = () => {
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
        // Implementar navegação para relatórios
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
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1 md:gap-2 py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#A502CA] text-[#A502CA]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="text-base md:text-lg" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
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
    </ProviderLayout>
  );
}
