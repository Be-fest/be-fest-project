'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MdArrowBack, 
  MdStar, 
  MdLocationOn, 
  MdWarning, 
  MdClose,
  MdPeople,
  MdAttachMoney,
  MdShare,
  MdWhatsapp,
  MdAdd
} from 'react-icons/md';
import { Header } from '@/components/Header';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { getServiceByIdAction } from '@/lib/actions/services';
import { ServiceWithProvider, ServiceWithDetails } from '@/types/database';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToastGlobal();
  const serviceId = params.id as string;
  
  const [service, setService] = useState<ServiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParty, setSelectedParty] = useState<{ id: string; name: string } | null>(null);

  // Detectar se estamos adicionando serviço para uma festa específica
  useEffect(() => {
    const partyId = searchParams.get('partyId');
    const partyName = searchParams.get('partyName');
    
    if (partyId && partyName) {
      setSelectedParty({ id: partyId, name: decodeURIComponent(partyName) });
    } else {
      setSelectedParty(null);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        console.log('Buscando serviço com ID:', serviceId);
        
        if (!serviceId) {
          setError('ID do serviço não fornecido');
          setLoading(false);
          return;
        }

        const result = await getServiceByIdAction(serviceId);
        
        console.log('Resultado da action:', result);

        if (!result.success) {
          setError(result.error || 'Erro ao buscar serviço');
          return;
        }

        if (!result.data) {
          setError('Serviço não encontrado');
          return;
        }

        console.log('Serviço encontrado:', result.data);
        setService(result.data);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Erro ao carregar dados do serviço');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getPriceInfo = () => {
    if (!service) return null;
    
    if (service.base_price && service.base_price > 0) {
      return {
        price: formatPrice(service.base_price),
        unit: ''
      };
    }
    
    if (service.price_per_guest && service.price_per_guest > 0) {
      return {
        price: formatPrice(service.price_per_guest),
        unit: 'por pessoa'
      };
    }
    
    return {
      price: 'Preço sob consulta',
      unit: ''
    };
  };

  const handleWhatsAppContact = () => {
    if (!service?.provider) return;
    
    // Usar número padrão por enquanto - pode ser melhorado depois
    const phone = '5511999999999';
    const message = `Olá! Tenho interesse no serviço ${service.name}. Gostaria de mais informações.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${service?.name} - ${service?.provider?.organization_name || service?.provider?.full_name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Confira este serviço incrível: ${service?.name}`,
          url
        });
      } catch (error) {
        // Fallback para copiar URL
        navigator.clipboard.writeText(url);
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleAddServiceToParty = () => {
    if (!service || !selectedParty) return;
    
    toast.success(
      'Serviço adicionado!',
      `${service.name} foi adicionado à festa "${selectedParty.name}"`
    );
    
    // Redirecionar de volta para a festa
    setTimeout(() => {
      router.push(`/perfil?tab=minhas-festas&eventId=${selectedParty.id}`);
    }, 1500);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="pt-20 pb-8 min-h-screen bg-[#FFF6FB]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Header />
        <div className="pt-20 pb-8 min-h-screen bg-[#FFF6FB]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center py-12">
              <MdWarning className="text-red-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
              <p className="text-gray-600 mb-8">
                O serviço que você está procurando não foi encontrado.
              </p>
              <Link
                href="/servicos"
                className="bg-[#FF0080] text-white px-6 py-3 rounded-lg hover:bg-[#E6006F] transition-colors"
              >
                Voltar aos Serviços
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const priceInfo = getPriceInfo();

  return (
    <>
      <Header />
      <div className="pt-20 pb-8 min-h-screen bg-[#FFF6FB]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          {/* Botão Voltar */}
          <div className="mb-6">
            <Link
              href="/servicos"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <MdArrowBack className="text-xl" />
              Voltar aos Serviços
            </Link>
          </div>

          {/* Card de Adicionando à Festa */}
          {selectedParty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] rounded-xl p-6 mb-6 text-white relative overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute transform rotate-45 -top-4 -right-4 w-16 h-16 bg-white rounded-lg"></div>
                <div className="absolute transform rotate-12 top-8 right-8 w-8 h-8 bg-white rounded"></div>
                <div className="absolute transform -rotate-12 bottom-4 right-12 w-12 h-12 bg-white rounded-full"></div>
              </div>
              
              <div className="relative">
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  🎉 Adicionando à Festa
                </h2>
                <p className="text-lg font-medium opacity-90">
                  {selectedParty.name}
                </p>
                <p className="text-sm opacity-75 mt-1">
                  Você está adicionando este serviço à sua festa
                </p>
              </div>
            </motion.div>
          )}

          {/* Card do Serviço */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Imagem do Serviço */}
            <div className="relative h-64 md:h-80 bg-gray-200">
              <img
                src={service.images_urls?.[0] || service.provider?.profile_image || service.provider?.logo_url || '/be-fest-provider-logo.png'}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay com informações básicas */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between text-white">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{service.name}</h1>
                    <p className="text-sm md:text-base opacity-90">
                      por {service.provider?.organization_name || service.provider?.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-black/30 rounded-full px-3 py-1">
                    <MdStar className="text-yellow-400" />
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-6 md:p-8">
              {/* Categoria e Preço */}
              <div className="flex items-center justify-between mb-6">
                <span className="inline-block bg-[#FF0080] text-white px-4 py-2 rounded-full text-sm font-medium">
                  {service.category}
                </span>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold text-[#FF0080]">
                    {priceInfo?.price}
                  </div>
                  {priceInfo?.unit && (
                    <div className="text-sm text-gray-600">{priceInfo.unit}</div>
                  )}
                </div>
              </div>

              {/* Informações do Prestador */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={service.provider?.profile_image || service.provider?.logo_url || '/be-fest-provider-logo.png'}
                    alt={service.provider?.organization_name || service.provider?.full_name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {service.provider?.organization_name || service.provider?.full_name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <MdLocationOn className="text-base" />
                    <span>{service.provider?.area_of_operation || 'São Paulo'}</span>
                  </div>
                </div>
              </div>

              {/* Descrição do Serviço */}
              {service.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Descrição do Serviço</h2>
                  <div className="text-gray-600 leading-relaxed">
                    <SafeHTML 
                      html={service.description} 
                      fallback="Sem descrição disponível"
                    />
                  </div>
                </div>
              )}

              {/* Informações de Capacidade */}
              {(service.min_guests || service.max_guests) && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MdPeople className="text-blue-600" />
                    Capacidade
                  </h3>
                  <div className="text-gray-600">
                    {service.min_guests && service.max_guests ? (
                      `De ${service.min_guests} a ${service.max_guests} pessoas`
                    ) : service.min_guests ? (
                      `Mínimo de ${service.min_guests} pessoas`
                    ) : service.max_guests ? (
                      `Máximo de ${service.max_guests} pessoas`
                    ) : null}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex flex-col md:flex-row gap-4">
                {selectedParty ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddServiceToParty}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MdAdd className="text-xl" />
                    Adicionar à Festa
                  </motion.button>
                ) : (
                  <Link
                    href="/minhas-festas"
                    className="flex-1 bg-[#FF0080] hover:bg-[#E6006F] text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <MdAdd className="text-xl" />
                    Adicionar à uma Festa
                  </Link>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MdShare className="text-xl" />
                  Compartilhar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 