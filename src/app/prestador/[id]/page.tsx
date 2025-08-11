'use client';

import { use, useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ProviderServices } from '@/components/ProviderServices';
import { motion } from 'framer-motion';
import { MdStar, MdLocationOn, MdArrowBack, MdWarning } from 'react-icons/md';
import { User, ServiceWithProvider } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useServiceImage } from '@/hooks/useImagePreloader';
import { calculatePriceWithFee } from '@/utils/pricingUtils';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Skeleton Components
const ProviderSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    {/* Provider Header */}
    <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-b border-purple-100">
      {/* Padrão decorativo sutil */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
          <circle cx="50" cy="50" r="30" fill="#F71875"/>
          <circle cx="350" cy="40" r="20" fill="#8B5CF6"/>
          <circle cx="80" cy="150" r="25" fill="#EC4899"/>
          <circle cx="320" cy="160" r="15" fill="#A855F7"/>
        </svg>
      </div>
      
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-auto flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-6">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gray-300 animate-pulse shadow-xl border-2 border-white flex-shrink-0"></div>
        <div className="text-gray-800 min-w-0 flex-1">
          <div className="h-6 md:h-8 w-full max-w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
          <div className="flex flex-col gap-2 text-sm md:text-base">
            <div className="flex items-center gap-1 text-gray-600 bg-white/80 px-2 md:px-3 py-1 rounded-full w-fit">
              <MdLocationOn className="text-pink-500 flex-shrink-0" />
              <div className="h-4 w-20 md:w-24 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Provider Content */}
    <div className="p-3 md:p-6 lg:p-8">
      <div className="mb-4 md:mb-8">
        <h2 className="text-lg md:text-2xl font-bold text-[#520029] mb-3 md:mb-4">Sobre</h2>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div>
        <h2 className="text-lg md:text-2xl font-bold text-[#520029] mb-3 md:mb-4">Serviços</h2>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="h-12 md:h-16 bg-gray-300 animate-pulse"></div>
              <div className="p-3 md:p-6 space-y-3 md:space-y-4">
                {[1, 2, 3].map((j) => (
                    <div key={j} className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg">
                      <div className="w-full md:w-20 h-32 md:h-20 rounded-lg bg-gray-300 animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 w-full space-y-2">
                        <div className="h-4 md:h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 md:h-4 w-full max-w-48 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div className="h-5 md:h-6 w-20 bg-gray-300 rounded animate-pulse"></div>
                          <div className="w-full md:w-24 h-8 bg-blue-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Converter dados reais para formato esperado pelo ProviderServices
const convertToProviderData = (provider: User, services: ServiceWithProvider[]) => {
  const providerName = provider.organization_name || provider.full_name || 'Prestador';
  
  // Agrupar serviços por categoria
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      id: service.id, // Manter o ID real do serviço
      name: service.name,
      description: service.description || 'Serviço de qualidade para sua festa',
      price: calculatePriceWithFee(service.guest_tiers?.[0]?.base_price_per_adult || 0), // Aplicar taxa de 10%
      image: service.images_urls?.[0],
      providerId: service.provider_id // Adicionar providerId real
    });
    return acc;
  }, {} as Record<string, any[]>);

  // Converter para formato de categorias
  const categorizedServices = Object.entries(servicesByCategory).map(([category, items], index) => ({
    id: index + 1,
    category,
    items
  }));
  
  return {
    id: provider.id,
    name: providerName,
    description: provider.organization_description || 
      'Prestador de serviços para festas e eventos',
    image: provider.profile_image || '/be-fest-provider-logo.png',
    location: {
      neighborhood: provider.area_of_operation || 'Área de atuação não informada',
      city: provider.state || 'Estado não informado'
    },
    services: categorizedServices
  };
};

// Componente para imagem de serviço
function ServiceImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const imageState = useServiceImage(src);
  
  return (
    <img
      src={imageState.src}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}

export default function ProviderPage({ params }: PageProps) {
  const id = use(params).id;
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const supabase = createClient();
        
        // Buscar dados do prestador
        const { data: provider, error: providerError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .eq('role', 'provider')
          .single();

        if (providerError || !provider) {
          setError('Prestador não encontrado');
          return;
        }

        // Buscar serviços do prestador
        const { data: providerServices, error: servicesError } = await supabase
          .from('services')
          .select(`
            *,
            provider:users!services_provider_id_fkey (
              id,
              full_name,
              organization_name,
              profile_image,
              area_of_operation
            )
          `)
          .eq('provider_id', id)
          .eq('is_active', true)
          .eq('status', 'active');

        if (servicesError) {
          console.error('Error fetching services:', servicesError);
        }

        // Converter dados para formato esperado
        const convertedData = convertToProviderData(provider, providerServices || []);
        setProviderData(convertedData);

      } catch (err) {
        console.error('Error fetching provider data:', err);
        setError('Erro ao carregar dados do prestador');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            {/* Botão Voltar */}
            <div className="mb-4 mt-8">
              <Link
                href="/servicos"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-block"
              >
                <MdArrowBack className="text-2xl text-[#F71875]" />
              </Link>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProviderSkeleton />
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  if (error || !providerData) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center px-4">
        <div className="text-center">
          <MdWarning className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-[#520029] mb-4">
            {error || 'Prestador não encontrado'}
          </h2>
          <Link
            href="/prestadores"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center"
          >
            <MdArrowBack className="text-2xl text-[#F71875]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Botão Voltar */}
          <div className="mb-4 mt-8">
            <Link
              href="/servicos"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-block"
            >
              <MdArrowBack className="text-2xl text-[#F71875]" />
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Provider Header */}
            <div className="relative h-48 md:h-64 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-b border-purple-100">
              {/* Padrão decorativo sutil */}
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
                  <circle cx="50" cy="50" r="30" fill="#F71875"/>
                  <circle cx="350" cy="40" r="20" fill="#8B5CF6"/>
                  <circle cx="80" cy="150" r="25" fill="#EC4899"/>
                  <circle cx="320" cy="160" r="15" fill="#A855F7"/>
                </svg>
              </div>
              
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-auto flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white p-2 md:p-3 shadow-xl border-2 border-white flex-shrink-0">
                  <img
                    src={providerData.image}
                    alt={`${providerData.name} logo`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="text-gray-800 min-w-0 flex-1">
                  <h1 className="text-xl md:text-3xl font-bold mb-2 text-gray-900 break-words">{providerData.name}</h1>
                  <div className="flex flex-col gap-2 text-sm md:text-base">
                    <div className="flex items-center gap-1 text-gray-600 bg-white/80 px-2 md:px-3 py-1 rounded-full w-fit">
                      <MdLocationOn className="text-pink-500 flex-shrink-0" />
                      <span className="truncate">{providerData.location.neighborhood}, {providerData.location.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Content */}
            <div className="p-3 md:p-6 lg:p-8">
              <div className="mb-4 md:mb-8">
                <h2 className="text-lg md:text-2xl font-bold text-[#520029] mb-3 md:mb-4">Sobre</h2>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">{providerData.description}</p>
              </div>

              <div>
                <h2 className="text-lg md:text-2xl font-bold text-[#520029] mb-3 md:mb-4">Serviços</h2>
                {providerData.services && providerData.services.length > 0 ? (
                  <ProviderServices 
                    services={providerData.services} 
                    providerId={providerData.id} 
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhum serviço disponível
                    </h3>
                    <p className="text-gray-500">
                      Este prestador ainda não possui serviços cadastrados.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
