'use client';

import { motion } from 'framer-motion';
import { MdAdd } from 'react-icons/md';
import { ShareButton } from './ShareButton';
import { useCart } from '@/contexts/CartContext';
import { useOffCanvas } from '@/contexts/OffCanvasContext';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

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
  const { addToCart, partyData } = useCart();
  const { openOffCanvas } = useOffCanvas();
  const toast = useToastGlobal();

  const handleAddToCart = (item: ServiceItem, categoryName: string) => {
    const serviceData = {
      serviceId: item.id, // Usar o ID real do serviço
      name: item.name,
      serviceName: item.name,
      price: item.price,
      quantity: 1,
      providerId: item.providerId || providerId || '1', // Usar providerId do item ou da prop
      providerName: categoryName,
      category: 'service',
      image: item.image
    };

    // Sempre adicionar ao carrinho primeiro
    addToCart(serviceData);

    // Mostrar toast de sucesso
    toast.success(
      'Serviço adicionado!',
      `${item.name} foi adicionado ao seu carrinho.`,
      3000
    );

    // Sempre abrir o offcanvas para mostrar o carrinho
    openOffCanvas();
  };
  return (
    <div className="space-y-8">
      {services.map((category, categoryIndex) => (
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
                  <p className="text-[#6E5963] text-sm mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#FF0080]">
                      R$ {item.price.toFixed(2)}
                    </span>                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(item, category.category)}
                      className="bg-[#FF0080] text-white p-2 rounded-full hover:bg-[#E6006F] transition-colors duration-300 group-hover:shadow-lg"
                    >
                      <MdAdd className="text-xl" />
                    </motion.button>
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
            onClick={() => openOffCanvas()}
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
