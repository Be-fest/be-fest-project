'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/Header';
import { ProviderServices } from '@/components/ProviderServices';
import { ProviderBudget } from '@/components/ProviderBudget';
import { motion } from 'framer-motion';
import { MdStar, MdLocationOn } from 'react-icons/md';
import { ServiceProvider, Service } from '@/types/database';
import { api } from '@/services/api';

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'services' | 'budget'>('services');
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviderData = async () => {
      try {        const [providerData, servicesData] = await Promise.all([
          api.getServiceProviderById(id),
          api.getServicesByProviderId(id)
        ]);
        
        setProvider(providerData);
        setServices(servicesData);
      } catch (error) {
        console.error('Erro ao carregar dados do prestador:', error);
      } finally {
        setLoading(false);
      }
    };    loadProviderData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFF9F9' }}>
        <Header />
        <div className="bg-white shadow-sm pt-20">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-start animate-pulse">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FFF9F9' }}>
        <Header />
        <div className="container mx-auto px-4 md:px-6 py-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#520029] mb-4">
              Prestador não encontrado
            </h1>
            <p className="text-[#6E5963]">
              O prestador que você está procurando não existe ou não está mais disponível.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            >
              <img 
                src={provider.logo_url || '/placeholder-logo.png'} 
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
                {provider.organization_name || provider.full_name || 'Nome não disponível'}
              </h1>
              <p className="text-lg text-[#6E5963] mb-4">
                Prestador de Serviços
              </p>
              
              {/* Rating - Placeholder até implementar sistema de avaliação */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <MdStar className="text-yellow-400 text-xl" />
                  <span className="font-semibold text-[#520029]">4.5</span>
                  <span className="text-[#6E5963]">(Avaliações em breve)</span>
                </div>
              </div>

              {/* Location Info */}
              <div className="flex items-center gap-1 text-sm text-[#6E5963] mb-4">
                <MdLocationOn className="text-[#FF0080]" />
                <span>{provider.area_of_operation || 'Área não informada'}</span>
              </div>

              {/* Contact Info */}
              {provider.whatsapp_number && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-[#6E5963]">
                    WhatsApp: {provider.whatsapp_number}
                  </span>
                </div>
              )}

              <p className="text-[#6E5963] leading-relaxed">
                {provider.organization_name 
                  ? `${provider.organization_name} oferece serviços de qualidade para seu evento.`
                  : 'Prestador de serviços qualificado para atender suas necessidades.'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
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
              Serviços ({services.length})
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
      <div className="container mx-auto px-4 md:px-6 py-8">
        {activeTab === 'services' && (
          <>
            {services.length > 0 ? (
              <ProviderServices services={services} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-[#520029] mb-4">
                  Nenhum serviço cadastrado
                </h3>
                <p className="text-[#6E5963]">
                  Este prestador ainda não cadastrou seus serviços.
                </p>
              </div>
            )}
          </>
        )}
        {activeTab === 'budget' && (
          <>
            {services.length > 0 ? (
              <ProviderBudget services={services} provider={provider} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-[#520029] mb-4">
                  Orçamento indisponível
                </h3>
                <p className="text-[#6E5963]">
                  Este prestador precisa cadastrar serviços para disponibilizar orçamentos.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
