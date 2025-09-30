'use client';

import { motion } from 'framer-motion';
import { MdVisibility } from 'react-icons/md';
import { ShareButton } from './ShareButton';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { calculatePriceWithFee } from '@/utils/pricingUtils';
import { useState, useEffect } from 'react';

interface ServiceItem {
  id: string; // Mudar para string para aceitar UUIDs
  name: string;
  description: string;
  price: number;
  image: string;
  providerId?: string; // Adicionar providerId opcional
}

interface ServiceCategory {
  id: number;
  category: string;
  items: ServiceItem[];
}

interface ProviderServicesProps {
  services: ServiceCategory[];
  providerId?: string; // Adicionar providerId como prop
  initialSort?: 'relevance' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc';
  onSortChange?: (sort: 'relevance' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc') => void;
}

export function ProviderServices({ services, providerId, initialSort = 'relevance', onSortChange }: ProviderServicesProps) {
  const toast = useToastGlobal();
  const [servicesWithPrices, setServicesWithPrices] = useState<ServiceCategory[]>(services);
  const [sort, setSort] = useState<
    'relevance' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  >(initialSort);

  useEffect(() => {
    const fetchServicePrices = async () => {
      try {
        const supabase = createClient();
        
        // Buscar todos os service_guest_tiers para os serviços
        const serviceIds = services.flatMap(category => 
          category.items.map(item => item.id)
        );

        if (serviceIds.length === 0) return;

        const { data: guestTiers, error } = await supabase
          .from('service_guest_tiers')
          .select('*')
          .in('service_id', serviceIds);

        if (error) {
          console.error('Error fetching guest tiers:', error);
          return;
        }

        // Agrupar tiers por service_id
        const tiersByService = guestTiers.reduce((acc, tier) => {
          if (!acc[tier.service_id]) {
            acc[tier.service_id] = [];
          }
          acc[tier.service_id].push(tier);
          return acc;
        }, {} as Record<string, any[]>);

        // Atualizar preços dos serviços
        const sortItems = (items: ServiceItem[]) => {
          const sorted = [...items];
          switch (sort) {
            case 'name_asc':
              sorted.sort((a, b) => a.name.localeCompare(b.name));
              break;
            case 'name_desc':
              sorted.sort((a, b) => b.name.localeCompare(a.name));
              break;
            case 'price_asc':
              sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
              break;
            case 'price_desc':
              sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
              break;
          }
          return sorted;
        };

        const updatedServices = services.map(category => ({
          ...category,
          items: sortItems(category.items.map(item => {
            const tiers = tiersByService[item.id] || [];
            let price = 0;
            
            if (tiers.length > 0) {
              // Ordenar por min_total_guests e pegar o menor preço
              const sortedTiers = [...tiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
              const minTier = sortedTiers[0];
              if (minTier) {
                price = calculatePriceWithFee(minTier.base_price_per_adult);
              }
            } else {
              // Fallback para serviços sem guest_tiers
              price = calculatePriceWithFee(0);
            }

            return {
              ...item,
              price
            };
          }))
        }));

        setServicesWithPrices(updatedServices);
      } catch (err) {
        console.error('Error fetching service prices:', err);
      }
    };

    fetchServicePrices();
  }, [services]);

  // Sort whenever sort state or prices change
  useEffect(() => {
    const sortItems = (items: ServiceItem[]) => {
      const sorted = [...items];
      switch (sort) {
        case 'name_asc':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name_desc':
          sorted.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price_asc':
          sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
          break;
        case 'price_desc':
          sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
          break;
        default:
          // relevance: keep original order
          break;
      }
      return sorted;
    };

    setServicesWithPrices(prev =>
      prev.map(cat => ({ ...cat, items: sortItems(cat.items) }))
    );
  }, [sort]);

  const handleSortChange = (value: 'relevance' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc') => {
    setSort(value);
    onSortChange?.(value);
  };

  const handleViewService = (item: ServiceItem, categoryName: string) => {
    // Mostrar toast de informação
    toast.info(
      'Redirecionando...',
      `Você será redirecionado para ver os detalhes de ${item.name}`,
      2000
    );
  };

  return (
    <div className="space-y-8">
      {/* Sorting bar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div />
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">Ordenar por:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="relevance">Relevância</option>
            <option value="name_asc">Nome (A-Z)</option>
            <option value="name_desc">Nome (Z-A)</option>
            <option value="price_asc">Preço (menor)</option>
            <option value="price_desc">Preço (maior)</option>
          </select>
        </div>
      </div>

      {servicesWithPrices.map((category, categoryIndex) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Category Header */}
          <div className="bg-gradient-to-r from-[#FF0080] to-[#CD0067] px-4 md:px-6 py-3 md:py-4">
            <h2 className="text-lg md:text-xl font-bold text-white">{category.category}</h2>
          </div>

          {/* Category Items */}
          <div className="p-3 md:p-6 space-y-3 md:space-y-4">
            {category.items.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg hover:border-[#FF0080] hover:shadow-md transition-all duration-300 group"
              >
                {/* Service Image */}
                <div className="w-full md:w-20 h-32 md:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Service Info */}
                <div className="flex-1 w-full">
                  <h3 className="text-base md:text-lg font-semibold text-[#520029] mb-2">
                    {item.name}
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <span className="text-lg md:text-xl font-bold text-[#FF0080]">
                      A partir de R$ {(item.price || 0).toFixed(2)}
                    </span>
                    <Link href={`/servicos/${item.id}?from=provider-site&providerId=${providerId}`} className="w-full md:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewService(item, category.category)}
                        className="w-full md:w-auto bg-[#FF0080] text-white px-4 py-2 rounded-lg hover:bg-[#E6006F] transition-colors duration-300 group-hover:shadow-lg flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <MdVisibility className="text-lg" />
                        Ver Serviço
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Contact CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gradient-to-r from-[#520029] to-[#FF0080] rounded-xl p-4 md:p-8 text-center text-white"
      >
      
        <p className="text-pink-100 mb-4 md:mb-6 max-w-2xl mx-auto text-sm md:text-base">
          Compartilhe este prestador e ajude outros a encontrarem serviços incríveis para seus eventos!
        </p>        
        <div className="flex flex-col gap-3 md:gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.info('Redirecionando...', 'Você será redirecionado para criar sua festa.', 2000)}
            className="w-full md:w-auto bg-white text-[#FF0080] px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
          >
            Criar minha festa
          </motion.button>
          <div className="w-full md:w-auto">
            <ShareButton 
              title="Prestador Be-Fest"
              description="Interessado nos nossos serviços? Compartilhe e personalize seu evento dos sonhos!"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
