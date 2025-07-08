'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MdStar, MdLocationOn, MdWarning } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { getPublicServicesAction } from '@/lib/actions/services';
import { ServiceWithProvider } from '@/types/database';
import { ServicesSkeleton } from '@/components/ui';

interface ProvidersGridProps {
  selectedCategory?: string;
  searchQuery?: string;
}

interface GroupedProvider {
  id: string;
  name: string;
  services: ServiceWithProvider[];
  minPrice: number;
  serviceCount: number;
}

export function ProvidersGrid({ selectedCategory, searchQuery }: ProvidersGridProps) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getPublicServicesAction({
          category: selectedCategory,
          search: searchQuery,
          limit: 100 // Aumentar para pegar mais serviços
        });

        if (result.success && result.data) {
          setServices(result.data);
        } else {
          setError(result.error || 'Erro ao carregar serviços');
        }
      } catch (err) {
        setError('Erro ao carregar serviços');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, searchQuery]);

  // Agrupar serviços por prestador
  const groupedProviders = services.reduce((acc, service) => {
    const providerId = service.provider_id;
    const providerName = service.provider?.organization_name || service.provider?.full_name || 'Prestador';
    
    if (!acc[providerId]) {
      acc[providerId] = {
        id: providerId,
        name: providerName,
        services: [],
        minPrice: Infinity,
        serviceCount: 0,
        provider: service.provider
      };
    }
    
    acc[providerId].services.push(service);
    acc[providerId].serviceCount++;
    
    // Calcular o menor preço considerando base_price e price_per_guest
    const servicePrice = service.base_price || 0;
    const pricePerGuest = service.price_per_guest || 0;
    
    // Usar o menor entre base_price e price_per_guest (se existir)
    let minServicePrice = servicePrice;
    if (pricePerGuest > 0 && pricePerGuest < minServicePrice) {
      minServicePrice = pricePerGuest;
    }
    
    if (minServicePrice < acc[providerId].minPrice) {
      acc[providerId].minPrice = minServicePrice;
    }
    
    return acc;
  }, {} as Record<string, GroupedProvider & { provider: any }>);

  // Converter para array e pegar apenas os 12 primeiros
  const providers = Object.values(groupedProviders).slice(0, 12);

  const handleProviderClick = (providerId: string) => {
    router.push(`/prestador/${providerId}`);
  };

  if (loading) {
    return <ServicesSkeleton count={12} />;
  }

  if (error) {
    return (
      <section className="py-12 md:py-16" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center">
            <MdWarning className="text-red-500 text-4xl mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FF0080] text-white rounded-lg hover:bg-[#E6006F] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (providers.length === 0) {
    return (
      <section className="py-12 md:py-16" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MdWarning className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">
              Nenhum prestador encontrado
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {selectedCategory 
                ? `Não encontramos prestadores para a categoria "${selectedCategory}". Tente outra categoria ou remova os filtros.`
                : 'Não há prestadores disponíveis no momento. Novos prestadores em breve!'
              }
            </p>
            {selectedCategory && (
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-[#FF0080] text-white rounded-lg hover:bg-[#E6006F] transition-colors"
              >
                Ver todos os prestadores
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-xl shadow-md border border-gray-100/50 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FF0080] to-[#E6006F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {provider.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#520029] group-hover:text-[#FF0080] transition-colors duration-300 leading-tight">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {provider.serviceCount} serviço{provider.serviceCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg px-2 py-1 flex items-center gap-1">
                    <MdStar className="text-yellow-500 text-sm" />
                    <span className="font-bold text-sm text-gray-800">4.8</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-xs text-white bg-gradient-to-r from-[#FF0080] to-[#E6006F] font-medium uppercase tracking-wide px-3 py-1 rounded-full inline-block">
                    {provider.services[0]?.category || 'Serviços'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {provider.services[0]?.description || 'Prestador de serviços de qualidade para sua festa'}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-500">
                    <MdLocationOn className="text-sm" />
                    <span className="text-sm">São Paulo, SP</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">A partir de</div>
                    <div className="font-bold text-[#FF0080] text-lg">
                      R$ {provider.minPrice === Infinity ? '0,00' : provider.minPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
