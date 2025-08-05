'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MdStar, MdArrowForward } from 'react-icons/md';
import { getPublicServicesAction } from '@/lib/actions/services';
import { ServiceWithProvider } from '@/types/database';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { formatMinimumPriceWithFee } from '@/utils/pricingUtils';
import { Categories } from '@/components/Categories';

// Skeleton para cards compactos
const CompactServiceSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-300"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Card compacto de serviço
const CompactServiceCard = ({ service }: { service: ServiceWithProvider }) => {
  const getPriceLabel = (service: ServiceWithProvider) => {
    if (service.guest_tiers && service.guest_tiers.length > 0) {
      const minPrice = formatMinimumPriceWithFee(service.guest_tiers);
      return `A partir de ${minPrice}`;
    }
    return 'Preço sob consulta';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
    >
      {/* Imagem do serviço */}
      <div className="relative h-32 bg-gray-200 overflow-hidden">
        <img
          src={service.images_urls?.[0] || service.provider?.profile_image || '/be-fest-provider-logo.png'}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Categoria badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-block bg-[#FF0080] text-white px-2 py-1 rounded-full text-xs font-medium">
            {service.category}
          </span>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{service.name}</h3>
        <p className="text-gray-600 text-xs mb-2 line-clamp-1">
          por {service.provider?.organization_name || service.provider?.full_name || 'Prestador'}
        </p>

        {/* Descrição compacta */}
        {service.description && (
          <div className="text-gray-600 text-xs mb-3 line-clamp-2">
            <SafeHTML 
              html={service.description} 
              fallback="Sem descrição disponível"
            />
          </div>
        )}

        {/* Preço */}
        <div className="text-[#FF0080] font-bold text-sm mb-3">
          {getPriceLabel(service)}
        </div>

        {/* Botão de ação */}
        <Link
          href={`/servicos/${service.id}`}
          className="w-full bg-[#FF0080] hover:bg-[#E6006F] text-white py-2 px-3 rounded-lg transition-colors duration-200 font-medium text-xs text-center block"
        >
          Ver Detalhes
        </Link>
      </div>
    </motion.div>
  );
};

export const ServicesSection = () => {
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getPublicServicesAction({
          category: selectedCategory,
          limit: 8, // Mostrar apenas 8 serviços na home
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
  }, [selectedCategory]);

  // Mapeamento de slugs para nomes de categoria
  const categorySlugToName: { [key: string]: string } = {
    'buffet': 'Buffet',
    'buffet-de-pizzas': 'Buffet de Pizzas',
    'churrasco': 'Churrasco',
    'confeitaria': 'Confeitaria',
    'estacoes-de-festa': 'Estações de Festa',
    'open-bar': 'Open-Bar',
    'chopp': 'Chopp'
  };

  const handleCategorySelect = (categorySlug: string) => {
    const categoryName = categorySlugToName[categorySlug];
    setSelectedCategory(categoryName === selectedCategory ? undefined : categoryName);
  };

  return (
    <section className="py-16 bg-[#FFF6FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#520029] mb-4">
            Serviços em Destaque
          </h2>
          <p className="text-[#6E5963] text-lg max-w-2xl mx-auto">
            Descubra os melhores serviços para tornar sua festa inesquecível
          </p>
        </motion.div>

        {/* Barra de Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Categories
            selectedCategory={selectedCategory}

            onCategorySelect={handleCategorySelect}
          />
        </motion.div>

        {/* Grid de serviços */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <CompactServiceSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <MdStar className="text-4xl mx-auto mb-2" />
              <p className="text-lg font-medium">Erro ao carregar serviços</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <MdStar className="text-4xl mx-auto mb-2" />
              <p className="text-lg font-medium">Nenhum serviço encontrado</p>
              <p className="text-sm">Tente novamente mais tarde</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {services.map((service) => (
                <CompactServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Botão para ver todos os serviços */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-12"
            >
              <Link
                href="/servicos"
                className="inline-flex items-center gap-2 bg-[#FF0080] hover:bg-[#E6006F] text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium text-lg shadow-lg hover:shadow-xl"
              >
                Ver Todos os Serviços
                <MdArrowForward className="text-xl" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};