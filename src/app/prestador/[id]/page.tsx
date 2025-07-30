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

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Skeleton Components
const ProviderSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
    {/* Header Skeleton */}
    <div className="relative h-48 md:h-64 bg-gray-300">
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-gray-400"></div>
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-400 rounded"></div>
          <div className="h-4 w-32 bg-gray-400 rounded"></div>
        </div>
      </div>
    </div>
    
    {/* Content Skeleton */}
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <div className="h-6 w-24 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
      
      <div>
        <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="h-16 bg-gray-300"></div>
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-20 h-20 rounded-lg bg-gray-300"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-gray-300 rounded"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-20 bg-gray-300 rounded"></div>
                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
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
      price: service.guest_tiers?.[0]?.base_price_per_adult || 0, // Usar preço do primeiro tier ou 0
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
    description: provider.area_of_operation ? 
      `Especializado em ${provider.area_of_operation}` : 
      'Prestador de serviços para festas e eventos',
    image: (provider as any).profile_image || provider.logo_url || '/be-fest-provider-logo.png',
    rating: 4.8,
    location: {
      neighborhood: provider.area_of_operation || 'Região',
      city: 'Cidade'
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
              logo_url,
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
            {/* Botão Voltar Skeleton */}
            <div className="mb-4 mt-8">
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
            
            <ProviderSkeleton />
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
            href="/servicos"
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
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#520029] to-[#FF0080]">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <img
                src={providerData.image}
                alt={providerData.name}
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl bg-white p-2 shadow-lg">
                  <img
                    src={providerData.image}
                    alt={`${providerData.name} logo`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{providerData.name}</h1>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm md:text-base">
                    <div className="flex items-center gap-1">
                      <MdStar className="text-yellow-400" />
                      <span>{providerData.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MdLocationOn />
                      <span>{providerData.location.neighborhood}, {providerData.location.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Content */}
            <div className="p-4 md:p-6 lg:p-8">
              <div className="mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#520029] mb-4">Sobre</h2>
                <p className="text-gray-600 text-sm md:text-base">{providerData.description}</p>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#520029] mb-4">Serviços</h2>
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
