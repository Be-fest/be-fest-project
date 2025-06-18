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

  return (    <section className="py-12 md:py-16" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {providers.map((provider, index) => (            <motion.div
              key={provider.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-xl shadow-md border border-gray-100/50 overflow-visible cursor-pointer hover:shadow-lg transition-all duration-300 group relative"
            >              
              <div className="relative h-32 overflow-hidden">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-sm">
                  <MdStar className="text-yellow-400 text-sm" />
                  <span className="font-bold text-sm text-gray-800">{provider.rating}</span>
                </div>                
                <div className="absolute -bottom-6 left-4">
                  <div className="w-2 h-2 bg-white rounded-xl shadow-xl flex items-center justify-center border-3 border-white group-hover:scale-105 transition-transform duration-300 z-10">
                    <img
                      src={provider.image}
                      alt={`${provider.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </div>
                </div>
              </div>              {/* Conteúdo do card - espaço para logo */}
              <div className="pt-8 px-4 pb-4 space-y-2">{/* Nome e categoria */}
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-[#520029] group-hover:text-[#FF0080] transition-colors duration-300 leading-tight">
                    {provider.name}
                  </h3>
                  <span className="text-xs text-white bg-gradient-to-r from-[#FF0080] to-[#E6006F] font-medium uppercase tracking-wide px-2 py-1 rounded-full inline-block">
                    {provider.category}
                  </span>
                </div>
                  {/* Localização - mais compacta */}
                <div className="flex items-center gap-2">
                  <MdLocationOn className="text-[#FF0080] text-sm flex-shrink-0" />
                  <span className="text-xs text-[#6E5963] font-medium">
                    {provider.location.neighborhood}, {provider.location.city}
                  </span>
                </div>
                  {/* Descrição - menor */}
                <p className="text-xs text-[#6E5963] line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>
                  {/* Footer com avaliações - mais compacto */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-[#6E5963]">
                    {provider.reviewCount} avaliações
                  </span>
                  <div className="flex items-center gap-1 text-[#FF0080] font-medium text-xs group-hover:gap-2 transition-all duration-300">
                    <span>Ver serviços</span>
                    <div className="w-4 h-4 bg-[#FF0080] rounded-full flex items-center justify-center text-white text-xs">
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
