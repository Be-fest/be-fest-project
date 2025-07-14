'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdArrowBack, MdSearch, MdStar, MdLocationOn, MdWarning, MdTune } from 'react-icons/md';
import { Categories } from '@/components/Categories';
import { getPublicServicesAction } from '@/lib/actions/services';
import { ServiceWithProvider } from '@/types/database';
import { Header } from '@/components/Header';
import { ServicesSkeleton } from '@/components/ui';

// Skeleton Components para a página de serviços
const SearchSkeleton = () => (
  <div className="space-y-8">
    {/* Search Bar Skeleton */}
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-12 bg-gray-300 rounded-lg"></div>
        <div className="w-full md:w-48 h-12 bg-gray-300 rounded-lg"></div>
        <div className="w-full md:w-32 h-12 bg-gray-300 rounded-lg"></div>
      </div>
    </div>

    {/* Categories Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-3"></div>
          <div className="h-4 bg-gray-300 rounded mx-auto w-20"></div>
        </div>
      ))}
    </div>
  </div>
);

// Interface para prestadores agrupados
interface GroupedProvider {
  id: string;
  name: string;
  services: ServiceWithProvider[];
  minPrice: number;
  serviceCount: number;
}

// Componente para exibir os prestadores agrupados
const ProvidersGrid = ({ services }: { services: ServiceWithProvider[] }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

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

  // Converter para array
  const providers = Object.values(groupedProviders);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <motion.div
          key={provider.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Imagem do prestador */}
          <div className="h-48 bg-gray-200 overflow-hidden">
            <img
              src={provider.provider?.logo_url || provider.services[0]?.images_urls?.[0] || '/placeholder-provider.jpg'}
              alt={provider.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Conteúdo do card */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{provider.name}</h3>
                <p className="text-gray-600 text-sm">
                  {provider.serviceCount} serviço{provider.serviceCount > 1 ? 's' : ''} disponível{provider.serviceCount > 1 ? 'is' : ''}
                </p>
              </div>
              <div className="flex items-center text-yellow-500">
                <MdStar className="text-lg mr-1" />
                <span className="text-sm font-medium text-gray-700">
                  5.0
                </span>
              </div>
            </div>

            {/* Mostrar algumas categorias */}
            <div className="mb-4">
              {provider.services.slice(0, 3).map((service, index) => (
                <span key={index} className="inline-block bg-[#FF0080] text-white px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2">
                  {service.category}
                </span>
              ))}
            </div>

            {/* Preço e localização */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#FF0080] font-bold text-lg">
                A partir de {formatPrice(provider.minPrice)}
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <MdLocationOn className="mr-1" />
                <span>{provider.provider?.area_of_operation || 'São Paulo'}</span>
              </div>
            </div>

            {/* Botão de ação */}
            <Link
              href={`/prestador/${provider.id}`}
              className="w-full bg-[#FF0080] hover:bg-[#E6006F] text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center block"
            >
              Ver Prestador
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch services when filters change
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getPublicServicesAction({
          category: selectedCategory,
          search: debouncedSearchQuery || undefined,
          limit: 50,
          location: locationFilter
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
  }, [selectedCategory, debouncedSearchQuery, locationFilter]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? undefined : category);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSearchQuery('');
    setLocationFilter('');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#FFF6FB] pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-4"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <SearchSkeleton />
            <ServicesSkeleton count={9} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FFF6FB] pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#520029] mb-4">
              Serviços Disponíveis
            </h1>
            <p className="text-[#6E5963] text-lg">
              Descubra os melhores serviços para sua festa
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Buscar serviços..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F71875] focus:border-transparent"
                />
              </div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F71875] focus:border-transparent"
              >
                <option value="">Todas as regiões</option>
                <option value="centro">Centro</option>
                <option value="zona-norte">Zona Norte</option>
                <option value="zona-sul">Zona Sul</option>
                <option value="zona-leste">Zona Leste</option>
                <option value="zona-oeste">Zona Oeste</option>
              </select>
              <button className="w-full md:w-auto px-6 py-3 bg-[#F71875] text-white rounded-lg hover:bg-[#E6006F] transition-colors flex items-center justify-center gap-2">
                <MdTune />
                Filtros
              </button>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Categories 
              onCategorySelect={handleCategorySelect}
            />
          </motion.div>

          {/* Active Filters */}
          {(selectedCategory || searchQuery || locationFilter) && (
            <div className="bg-white border-b border-gray-200 mb-8">
              <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Filtros ativos:</span>
                  {selectedCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF0080] text-white">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory(undefined)}
                        className="ml-2 hover:text-gray-200"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="ml-2 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {locationFilter && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {locationFilter}
                      <button
                        onClick={() => setLocationFilter('')}
                        className="ml-2 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#FF0080] hover:text-[#E6006F] underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Services Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {error && (
              <div className="text-center py-12">
                <MdWarning className="text-red-500 text-4xl mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#FF0080] text-white rounded-lg hover:bg-[#E6006F] transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && services.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MdWarning className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {selectedCategory || searchQuery || locationFilter
                    ? 'Não encontramos serviços com os filtros aplicados. Tente ajustar sua busca.'
                    : 'Não há serviços disponíveis no momento. Novos prestadores em breve!'
                  }
                </p>
                {(selectedCategory || searchQuery || locationFilter) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-[#FF0080] text-white rounded-lg hover:bg-[#E6006F] transition-colors"
                  >
                    Remover filtros
                  </button>
                )}
              </div>
            )}

            {!loading && !error && services.length > 0 && (
              <ServicesGrid services={services} />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
} 