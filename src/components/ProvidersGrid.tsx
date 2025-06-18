'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { mockProviders } from '@/data/mockData';

export function ProvidersGrid() {
  const router = useRouter();

  const handleProviderClick = (providerId: string) => {
    router.push(`/prestador/${providerId}`);
  };
  return (
    <section className="py-8 md:py-12" style={{ backgroundColor: '#FFF9F9' }}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {mockProviders.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden group-hover:bg-gray-100 transition-colors duration-300 border border-gray-100">                  <Image
                    src={provider.logo_url || '/images/outros/provider1.png'}
                    alt={provider.organization_name || provider.full_name || 'Prestador'}
                    width={64}
                    height={64}
                    className="w-12 h-12 md:w-16 md:h-16 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight">
                    {provider.organization_name || provider.full_name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">
                    {provider.area_of_operation}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
