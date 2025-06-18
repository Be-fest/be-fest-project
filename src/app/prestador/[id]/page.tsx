'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProviderServices } from '@/components/ProviderServices';
import { ProviderBudget } from '@/components/ProviderBudget';
import { motion } from 'framer-motion';
import { getMockProviderById, getMockProviderServices, getMockProviderRating } from '@/data/mockData';
import { MdStar, MdLocationOn } from 'react-icons/md';
import { mockProviders } from '@/data/mockProviders';

export default function ProviderPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'services' | 'budget'>('services');
  
  // Buscar dados do mock
  const provider = getMockProviderById(params.id);
  const services = getMockProviderServices(params.id);
  const { rating, reviews } = getMockProviderRating(params.id);
  
  if (!provider) {
    return <div>Prestador não encontrado</div>;
  }
  
  // Buscar o prestador pelos dados mock
  const providerData = mockProviders.find(provider => provider.id === params.id) || mockProviders[0];
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F9' }}>
      <Header />
      
      {/* Provider Header */}
      <div className="bg-white shadow-sm pt-20">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Provider Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white shadow-lg flex-shrink-0"
            >              <img 
                src={provider.logo_url || '/images/outros/provider1.png'} 
                alt={provider.organization_name || provider.full_name || 'Prestador'}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Provider Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-[#520029] mb-2">
                {provider.organization_name || provider.full_name}
              </h1>
              <p className="text-lg text-[#6E5963] mb-4">
                Comida e Bebida | Serviços de Buffet
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <MdStar className="text-yellow-400 text-xl" />
                  <span className="font-semibold text-[#520029]">{rating}</span>
                  <span className="text-[#6E5963]">({reviews} avaliações)</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-[#6E5963] mb-4">
                <div className="flex items-center gap-1">
                  <MdLocationOn className="text-[#FF0080]" />
                  <span>{provider.area_of_operation}</span>
                </div>
              </div>

              <p className="text-[#6E5963] leading-relaxed">
                Especialistas em buffet completo para festas e eventos. Comida de qualidade, serviço impecável e preços justos.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'services'
                  ? 'border-[#FF0080] text-[#FF0080]'
                  : 'border-transparent text-[#6E5963] hover:text-[#520029]'
              }`}
            >
              Serviços Principais
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'budget'
                  ? 'border-[#FF0080] text-[#FF0080]'
                  : 'border-transparent text-[#6E5963] hover:text-[#520029]'
              }`}
            >
              Orçamento
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">        {activeTab === 'services' && (
          <ProviderServices services={services} />
        )}{activeTab === 'budget' && (
          <ProviderBudget providerId={params.id} />
        )}
      </div>
    </div>
  );
}
