'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdArrowBack, MdSearch, MdStar, MdLocationOn, MdWarning, MdTune, MdClose, MdAdd, MdBusiness } from 'react-icons/md';
import { Categories } from '@/components/Categories';
import { getPublicProvidersAction } from '@/lib/actions/services';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { Header } from '@/components/Header';
import { ServicesSkeleton } from '@/components/ui';

interface ProviderData {
  id: string;
  organization_name?: string;
  logo_url?: string;
  profile_image?: string;
  area_of_operation?: string;
  services_count: number;
  average_rating?: number;
  created_at: string;
}

// Skeleton Components para a página de prestadores
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

// Componente para exibir os prestadores individuais
const ProvidersGrid = ({ providers }: { providers: ProviderData[] }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    return `Desde ${year}`;
  };

  const getProviderDisplayName = (provider: ProviderData) => {
    return provider.organization_name || 'Prestador';
  };

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
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            <img
              src={provider.profile_image || provider.logo_url || '/be-fest-provider-logo.png'}
              alt={getProviderDisplayName(provider)}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Conteúdo do card */}
          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{getProviderDisplayName(provider)}</h3>
              <p className="text-gray-600 text-sm">
                {formatDate(provider.created_at)}
              </p>
            </div>

            {/* Área de atuação */}
            {provider.area_of_operation && (
              <div className="mb-4">
                <span className="inline-block bg-[#FF0080] text-white px-3 py-1 rounded-full text-xs font-medium">
                  {provider.area_of_operation}
                </span>
              </div>
            )}

            {/* Informações do prestador */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MdBusiness className="text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">
                  {provider.services_count} serviço{provider.services_count !== 1 ? 's' : ''}
                </span>
              </div>
              
              {provider.average_rating && (
                <div className="flex items-center">
                  <MdStar className="text-yellow-400 mr-1" />
                  <span className="text-sm font-medium">{provider.average_rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Link
                href={`/prestador/${provider.id}`}
                className="flex-1 bg-[#FF0080] hover:bg-[#E6006F] text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center block"
              >
                Ver Serviços
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default function PrestadoresPage() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<ProviderData[]>([]);
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

  // Fetch providers when filters change
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getPublicProvidersAction({
          search: debouncedSearchQuery || undefined,
          limit: 50
        });

        if (result.success && result.data) {
          setProviders(result.data);
        } else {
          setError(result.error || 'Erro ao carregar prestadores');
        }
      } catch (err) {
        setError('Erro ao carregar prestadores');
        console.error('Error fetching providers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [debouncedSearchQuery]);

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
              Prestadores Disponíveis
            </h1>
            <p className="text-[#6E5963] text-lg">
              Descubra os melhores prestadores para sua festa
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
                  placeholder="Buscar prestadores..."
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

          {/* Providers Grid */}
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

            {!loading && !error && providers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MdWarning className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                  Nenhum prestador encontrado
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {selectedCategory || searchQuery || locationFilter
                    ? 'Não encontramos prestadores com os filtros aplicados. Tente ajustar sua busca.'
                    : 'Não há prestadores disponíveis no momento. Novos prestadores em breve!'
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

            {!loading && !error && providers.length > 0 && (
              <ProvidersGrid providers={providers} />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
} 