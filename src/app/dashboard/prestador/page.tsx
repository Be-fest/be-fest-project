'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdDashboard, MdAdd, MdBusiness, MdBarChart, MdNotifications } from 'react-icons/md';
import { ProviderLayout } from '@/components/dashboard/ProviderLayout';
import { ServiceManagement } from '@/components/dashboard/ServiceManagement';
import { ProviderStats } from '@/components/dashboard/ProviderStats';
import { OrderRequests } from '@/components/dashboard/OrderRequests';
import { ProviderProfile } from '@/components/dashboard/ProviderProfile';

type TabType = 'overview' | 'services' | 'orders' | 'profile';

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: MdDashboard },
    { id: 'services', label: 'Meus Serviços', icon: MdBusiness },
    { id: 'orders', label: 'Solicitações', icon: MdNotifications },
    { id: 'profile', label: 'Perfil', icon: MdBarChart },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProviderStats />;
      case 'services':
        return <ServiceManagement />;
      case 'orders':
        return <OrderRequests />;
      case 'profile':
        return <ProviderProfile />;
      default:
        return <ProviderStats />;
    }
  };

  return (
    <ProviderLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-[#520029]">Dashboard do Prestador</h1>
              <button className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <MdAdd />
                Novo Serviço
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#A502CA] text-[#A502CA]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="text-lg" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </ProviderLayout>
  );
}
