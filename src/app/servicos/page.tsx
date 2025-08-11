'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdArrowBack, MdSearch, MdStar, MdLocationOn, MdWarning, MdTune, MdClose, MdAdd } from 'react-icons/md';
import { Categories } from '@/components/Categories';
import { getPublicServicesAction } from '@/lib/actions/services';
import { addServiceToCartAction } from '@/lib/actions/cart';
import { ServiceWithProvider } from '@/types/database';
import { Header } from '@/components/Header';
import { ServicesSkeleton } from '@/components/ui';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { formatMinimumPrice } from '@/utils/formatters';
import { formatMinimumPriceWithFee } from '@/utils/pricingUtils';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Skeleton Components para a página de serviços
const SearchSkeleton = () => (
  <div className="space-y-8">
    {/* Search and Filters - Estrutura estática */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Buscar serviços..."
            disabled
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>
        <select
          disabled
          className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
        >
          <option value="">Todas as regiões</option>
        </select>
        <button 
          disabled
          className="w-full md:w-auto px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
        >
          <MdTune />
          Filtros
        </button>
      </div>
    </div>

    {/* Categories Skeleton - apenas os ícones das categorias */}
    <div className="grid grid-cols-2 md:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-3 animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded mx-auto w-20 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

// Componente para exibir os serviços individuais
const ServicesGrid = ({ services, selectedParty }: { 
  services: ServiceWithProvider[];
  selectedParty: { id: string; name: string } | null;
}) => {
  const toast = useToastGlobal();
  const router = useRouter();
  const { user } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getServicePrice = (service: ServiceWithProvider) => {
    if (service.guest_tiers && service.guest_tiers.length > 0) {
      return service.guest_tiers[0].base_price_per_adult || 0;
    }
    return 0; // Se não tem tiers, retorna 0
  };

  const getPriceLabel = (service: ServiceWithProvider) => {
    // Se tem tiers de preço, usar o preço mínimo com taxa de 10%
    if (service.guest_tiers && service.guest_tiers.length > 0) {
      const minPrice = formatMinimumPriceWithFee(service.guest_tiers);
      return `A partir de ${minPrice}`;
    }
    
    // Se não tem tiers de preço, mostrar preço sob consulta
    return 'Preço sob consulta';
  };

  const handleAddServiceDirectly = async (service: ServiceWithProvider) => {
    console.log('🔄 Iniciando adição de serviço:', {
      serviceId: service.id,
      serviceName: service.name,
      providerId: service.provider_id,
      selectedParty: selectedParty
    });

    // Verificar se o usuário está logado
    if (!user) {
      console.log('❌ Usuário não logado');
      toast.error(
        'Login necessário',
        'Você precisa fazer login para adicionar serviços às suas festas'
      );
      
      // Redirecionar para login com returnUrl
      const currentUrl = window.location.href;
      router.push(`/auth/login?returnUrl=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    // Se estiver logado mas não tem festa selecionada, redirecionar para perfil
    if (!selectedParty) {
      console.log('❌ Nenhuma festa selecionada');
      toast.info(
        'Selecione uma festa',
        'Você será redirecionado para selecionar uma festa'
      );
      
      // Redirecionar para perfil
      router.push('/perfil');
      return;
    }
    
    // Se estiver logado e tem festa selecionada, adicionar o serviço
    try {
      console.log('✅ Dados válidos, chamando addServiceToCartAction...');
      
      const result = await addServiceToCartAction({
        event_id: selectedParty.id,
        service_id: service.id,
        provider_id: service.provider_id,
        client_notes: null
      });

      console.log('📋 Resultado da action:', result);

      if (result.success) {
        console.log('✅ Serviço adicionado com sucesso!');
        toast.success(
          'Serviço adicionado!',
          `${service.name} foi adicionado à sua festa "${selectedParty.name}".`,
          3000
        );
        
        // Navegar para a página da festa após um pequeno delay
        setTimeout(() => {
                  console.log('🔄 Navegando para:', `/perfil?tab=minhas-festas&eventId=${selectedParty.id}`);
        router.push(`/perfil?tab=minhas-festas&eventId=${selectedParty.id}`);
        }, 1500);
      } else {
        console.error('❌ Erro ao adicionar serviço:', result.error);
        toast.error('Erro', result.error || 'Erro ao adicionar serviço.', 3000);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao adicionar serviço:', error);
      toast.error('Erro', 'Erro inesperado ao adicionar serviço.', 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Imagem do serviço */}
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            <img
              src={service.images_urls?.[0] || service.provider?.profile_image || '/be-fest-provider-logo.png'}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Conteúdo do card */}
          <div className="p-6">
            <div className="mb-3">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-gray-600 text-sm">
                por {service.provider?.organization_name || service.provider?.full_name || 'Prestador'}
              </p>
            </div>

            {/* Categoria */}
            <div className="mb-4">
              <span className="inline-block bg-[#FF0080] text-white px-3 py-1 rounded-full text-xs font-medium">
                {service.category}
              </span>
            </div>

            {/* Descrição */}
            {service.description && (
              <div className="text-gray-600 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                <SafeHTML 
                  html={service.description} 
                  fallback="Sem descrição disponível"
                />
              </div>
            )}

            {/* Preço e localização */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#FF0080] font-bold text-lg">
                {getPriceLabel(service)}
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Link
                href={selectedParty 
                  ? `/servicos/${service.id}?partyId=${selectedParty.id}&partyName=${encodeURIComponent(selectedParty.name)}`
                  : `/servicos/${service.id}`
                }
                className="flex-1 bg-[#FF0080] hover:bg-[#E6006F] text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center block"
              >
                Ver Cardápio
              </Link>
              
              {/* Botão de adicionar diretamente - sempre adiciona à festa */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAddServiceDirectly(service)}
                className="bg-[#FF0080] hover:bg-[#E6006F] text-white w-12 h-12 rounded-full transition-colors duration-200 shadow-lg flex items-center justify-center"
                title="Adicionar à festa"
              >
                <MdAdd className="text-xl" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedParty, setSelectedParty] = useState<{ id: string; name: string } | null>(null);

  // Detectar se estamos adicionando serviços para uma festa
  useEffect(() => {
    const partyId = searchParams.get('partyId');
    const partyName = searchParams.get('partyName');
    
    if (partyId && partyName) {
      setSelectedParty({ id: partyId, name: decodeURIComponent(partyName) });
    } else {
      setSelectedParty(null);
    }
  }, [searchParams]);

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
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            {/* Header - Estrutura estática */}
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

            {/* Card de Adicionando Serviços - se aplicável */}
            {selectedParty && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] rounded-xl p-6 mb-8 text-white relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute transform rotate-45 -top-4 -right-4 w-16 h-16 bg-white rounded-lg"></div>
                  <div className="absolute transform rotate-12 top-8 right-8 w-8 h-8 bg-white rounded"></div>
                  <div className="absolute transform -rotate-12 bottom-4 right-12 w-12 h-12 bg-white rounded-full"></div>
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2">
                      🎉 Adicionando Serviços para Festa
                    </h2>
                    <p className="text-lg font-medium opacity-90">
                      {selectedParty.name}
                    </p>
                    <p className="text-sm opacity-75 mt-1">
                      Selecione os serviços que deseja adicionar à sua festa
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedParty(null)}
                    className="bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
                    title="Fechar"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
              </motion.div>
            )}

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

          {/* Card de Adicionando Serviços */}
          {selectedParty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] rounded-xl p-6 mb-8 text-white relative overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute transform rotate-45 -top-4 -right-4 w-16 h-16 bg-white rounded-lg"></div>
                <div className="absolute transform rotate-12 top-8 right-8 w-8 h-8 bg-white rounded"></div>
                <div className="absolute transform -rotate-12 bottom-4 right-12 w-12 h-12 bg-white rounded-full"></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                    🎉 Adicionando Serviços para Festa
                  </h2>
                  <p className="text-lg font-medium opacity-90">
                    {selectedParty.name}
                  </p>
                  <p className="text-sm opacity-75 mt-1">
                    Selecione os serviços que deseja adicionar à sua festa
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedParty(null)}
                  className="bg-black/20 hover:bg-black/30 p-2 rounded-full transition-colors"
                  title="Fechar"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            </motion.div>
          )}

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
              <ServicesGrid services={services} selectedParty={selectedParty} />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}