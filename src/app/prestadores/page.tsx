'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdArrowBack, MdSearch, MdStar, MdLocationOn, MdWarning, MdTune, MdClose, MdAdd, MdBusiness } from 'react-icons/md';
import { Categories } from '@/components/Categories';
import { getPublicProvidersAction } from '@/lib/actions/services';
import { ProviderLogo } from '@/components/ui/ProviderLogo';
import { Header } from '@/components/Header';
import { ServicesSkeleton } from '@/components/ui';
import { ClientOnlyGuard } from '@/components/guards/ClientOnlyGuard';

interface ProviderData {
  id: string;
  organization_name?: string;
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
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        <div className="w-full md:w-48 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        <div className="w-full md:w-auto h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
      </div>
    </div>

    {/* Categories Skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mx-auto mb-4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded mx-auto w-24"></div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {providers.map((provider) => (
        <motion.div
          key={provider.id}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ 
            y: -8,
            transition: { duration: 0.3 }
          }}
          className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
        >
          {/* Gradiente de fundo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50 opacity-60"></div>
          
          {/* Imagem do prestador com overlay */}
          <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
            <img
              src={provider.profile_image || '/be-fest-provider-logo.png'}
              alt={getProviderDisplayName(provider)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Badge de destaque */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                <span className="text-xs font-semibold text-gray-700">⭐ Premium</span>
              </div>
            </div>
          </div>

          {/* Conteúdo do card */}
          <div className="relative p-6">
            {/* Header com nome e ano */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FF0080] transition-colors duration-300">
                {getProviderDisplayName(provider)}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"></div>
                <p className="text-gray-500 text-sm font-medium">
                  {formatDate(provider.created_at)}
                </p>
              </div>
            </div>

            {/* Área de atuação com design melhorado */}
            <div className="mb-5">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#FF0080] to-[#E6006F] text-white shadow-lg shadow-pink-200">
                <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-80"></div>
                {provider.area_of_operation || 'Geral'}
              </span>
            </div>

            {/* Informações do prestador com design aprimorado */}
            <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <MdBusiness className="text-[#FF0080] text-lg" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700">
                    {provider.services_count} serviço{provider.services_count !== 1 ? 's' : ''}
                  </span>
                  <p className="text-xs text-gray-500">disponíveis</p>
                </div>
              </div>
            </div>

            {/* Botão de ação com design moderno */}
            <div className="relative">
              <Link
                href={`/prestador/${provider.id}`}
                className="group/btn relative w-full bg-gradient-to-r from-[#FF0080] to-[#E6006F] hover:from-[#E6006F] hover:to-[#D1005A] text-white py-4 px-6 rounded-xl transition-all duration-300 font-semibold text-center block shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Ver Serviçosx
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Elemento decorativo */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF0080] to-[#E6006F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Componente que usa useSearchParams
function PrestadoresContent() {
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
  }, [debouncedSearchQuery, selectedCategory, locationFilter]);

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSearchQuery('');
    setLocationFilter('');
  };

  if (loading) {
    return (
      <>
        <Suspense fallback={<div className="h-16 bg-white shadow-sm"></div>}>
          <Header />
        </Suspense>
        <div className="min-h-screen bg-[#FFF6FB] pt-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4 w-96 animate-pulse"></div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-80 animate-pulse"></div>
            </div>
            
            <SearchSkeleton />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-56 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4 w-32"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-6 w-24"></div>
                    
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <ClientOnlyGuard>
      <Suspense fallback={<div className="h-16 bg-white shadow-sm"></div>}>
        <Header />
      </Suspense>
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
            className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 relative group">
                <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl group-focus-within:text-[#FF0080] transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Buscar prestadores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0080] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF0080] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="">Todas as regiões</option>
                <option value="centro">Centro</option>
                <option value="zona-norte">Zona Norte</option>
                <option value="zona-sul">Zona Sul</option>
                <option value="zona-leste">Zona Leste</option>
                <option value="zona-oeste">Zona Oeste</option>
              </select>
              <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#FF0080] to-[#E6006F] hover:from-[#E6006F] hover:to-[#D1005A] text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 transform hover:-translate-y-1">
                <MdTune className="text-lg" />
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 p-6"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">Filtros ativos:</span>
                </div>
                
                {selectedCategory && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-[#FF0080] to-[#E6006F] text-white shadow-lg shadow-pink-200">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-80"></div>
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory(undefined)}
                      className="ml-2 hover:text-gray-200 transition-colors duration-200"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </span>
                )}
                
                {searchQuery && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-md">
                    <MdSearch className="w-4 h-4 mr-2 text-gray-500" />
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 hover:text-gray-500 transition-colors duration-200"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </span>
                )}
                
                {locationFilter && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-md">
                    <MdLocationOn className="w-4 h-4 mr-2 text-gray-500" />
                    {locationFilter}
                    <button
                      onClick={() => setLocationFilter('')}
                      className="ml-2 hover:text-gray-500 transition-colors duration-200"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </span>
                )}
                
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#FF0080] hover:text-[#E6006F] font-semibold underline transition-colors duration-200 flex items-center gap-1"
                >
                  <MdClose className="w-4 h-4" />
                  Limpar filtros
                </button>
              </div>
            </motion.div>
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
    </ClientOnlyGuard>
  );
}

// Componente de fallback para o Suspense
function PrestadoresLoading() {
  return (
    <>
      <Suspense fallback={<div className="h-16 bg-white shadow-sm"></div>}>
        <Header />
      </Suspense>
      <div className="min-h-screen bg-[#FFF6FB] pt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4 w-96 animate-pulse"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-80 animate-pulse"></div>
          </div>
          <SearchSkeleton />
        </div>
      </div>
    </>
  );
}

// Componente principal da página
export default function PrestadoresPage() {
  return (
    <Suspense fallback={<PrestadoresLoading />}>
      <PrestadoresContent />
    </Suspense>
  );
}