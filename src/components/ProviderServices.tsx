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
}

export function ProviderServices({ services, providerId }: ProviderServicesProps) {
  const toast = useToastGlobal();
  const [servicesWithPrices, setServicesWithPrices] = useState<ServiceCategory[]>(services);

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
        const updatedServices = services.map(category => ({
          ...category,
          items: category.items.map(item => {
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
          })
        }));

        setServicesWithPrices(updatedServices);
      } catch (err) {
        console.error('Error fetching service prices:', err);
      }
    };

    fetchServicePrices();
  }, [services]);

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
      {servicesWithPrices.map((category, categoryIndex) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Category Header */}
          <div className="bg-gradient-to-r from-[#FF0080] to-[#CD0067] px-6 py-4">
            <h2 className="text-xl font-bold text-white">{category.category}</h2>
          </div>

          {/* Category Items */}
          <div className="p-6 space-y-4">
            {category.items.map((item, itemIndex) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#FF0080] hover:shadow-md transition-all duration-300 group"
              >
                {/* Service Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Service Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#520029] mb-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#FF0080]">
                      A partir de R$ {(item.price || 0).toFixed(2)}
                    </span>
                    <Link href={`/servicos/${item.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewService(item, category.category)}
                        className="bg-[#FF0080] text-white px-4 py-2 rounded-lg hover:bg-[#E6006F] transition-colors duration-300 group-hover:shadow-lg flex items-center gap-2 text-sm font-medium"
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
        className="bg-gradient-to-r from-[#520029] to-[#FF0080] rounded-xl p-8 text-center text-white"
      >
      
        <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
          Compartilhe este prestador e ajude outros a encontrarem serviços incríveis para seus eventos!
        </p>        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toast.info('Redirecionando...', 'Você será redirecionado para criar sua festa.', 2000)}
            className="bg-white text-[#FF0080] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
          >
            New Fest
          </motion.button>
          <ShareButton 
            title="Prestador New Fest"
            description="Interessado nos nossos serviços? Compartilhe e personalize seu evento dos sonhos!"
          />
        </div>
      </motion.div>
    </div>
  );
}
