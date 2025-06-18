'use client';

import { motion } from 'framer-motion';
import { MdAdd } from 'react-icons/md';
import { Service, ServiceCategoryEnum } from '@/types/database';

interface ProviderServicesProps {
  services: Service[];
}

export function ProviderServices({ services }: ProviderServicesProps) {
  // Agrupar serviços por categoria
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<ServiceCategoryEnum, Service[]>);

  return (
    <div className="space-y-8">
      {Object.entries(servicesByCategory).map(([categoryName, categoryServices], categoryIndex) => (
        <motion.div
          key={categoryName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          {/* Category Header */}
          <div className="bg-gradient-to-r from-[#FF0080] to-[#CD0067] px-6 py-4">
            <h2 className="text-xl font-bold text-white">{categoryName}</h2>
          </div>

          {/* Category Items */}
          <div className="p-6 space-y-4">
            {categoryServices.map((service, itemIndex) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: (categoryIndex * 0.1) + (itemIndex * 0.05) }}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#FF0080] hover:shadow-md transition-all duration-300 group"
              >
                {/* Service Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={service.images_urls?.[0] || '/placeholder-service.jpg'}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Service Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#520029] mb-1">
                    {service.name}
                  </h3>
                  <p className="text-[#6E5963] text-sm mb-2">
                    {service.description || 'Descrição não disponível'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#FF0080]">
                      R$ {(service.price_per_guest || 0).toFixed(2)} por pessoa
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#FF0080] text-white p-2 rounded-full hover:bg-[#E6006F] transition-colors duration-300 group-hover:shadow-lg"
                      title="Adicionar ao orçamento"
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
        <h3 className="text-2xl font-bold mb-4">
          Interessado nos nossos serviços?
        </h3>
        <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
          Entre em contato conosco para mais informações e personalize seu evento dos sonhos!
        </p>        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-[#FF0080] px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300"
          >
            New Fest
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#FF0080] transition-all duration-300"
          >
            Entrar em Contato
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
