'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getAllProviders } from '@/data/mockProviders';
import { MdStar, MdLocationOn } from 'react-icons/md';

export function ProvidersGrid() {
  const router = useRouter();
  const providers = getAllProviders();

  const handleProviderClick = (providerId: string) => {
    router.push(`/prestador/${providerId}`);
  };

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-xl shadow-md border border-gray-100/50 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={provider.image}
                      alt={`${provider.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-[#520029] group-hover:text-[#FF0080] transition-colors duration-300 leading-tight">
                        {provider.name}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg px-2 py-1 flex items-center gap-1">
                    <MdStar className="text-yellow-500 text-sm" />
                    <span className="font-bold text-sm text-gray-800">{provider.rating}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-xs text-white bg-gradient-to-r from-[#FF0080] to-[#E6006F] font-medium uppercase tracking-wide px-3 py-1 rounded-full inline-block">
                    {provider.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <MdLocationOn className="text-[#FF0080] text-sm flex-shrink-0" />
                  <span className="text-sm text-[#6E5963] font-medium">
                    {provider.location.neighborhood}, {provider.location.city}
                  </span>
                </div>

                <p className="text-sm text-[#6E5963] line-clamp-2 leading-relaxed mb-4">
                  {provider.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6E5963]">
                    {provider.reviewCount} avaliações
                  </span>
                  <div className="flex items-center gap-1 text-[#FF0080] font-medium text-sm group-hover:gap-2 transition-all duration-300">
                    <span>Ver serviços</span>
                    <div className="w-5 h-5 bg-[#FF0080] rounded-full flex items-center justify-center text-white text-xs">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
