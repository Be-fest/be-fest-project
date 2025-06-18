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

  return (    <section className="py-12 md:py-16" style={{ backgroundColor: '#FFF9F9' }}>
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
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
            >
              {/* Header com imagem de fundo */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Logo/Avatar do prestador */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                    <img
                      src={provider.image}
                      alt={`${provider.name} logo`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Rating badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                  <MdStar className="text-yellow-400 text-sm" />
                  <span className="font-bold text-sm text-gray-800">{provider.rating}</span>
                </div>
              </div>
              
              {/* Conteúdo do card */}
              <div className="p-6 space-y-3">
                {/* Nome e categoria */}
                <div>
                  <h3 className="font-bold text-xl text-[#520029] mb-1 group-hover:text-[#FF0080] transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-[#FF0080] font-semibold uppercase tracking-wide">
                    {provider.category}
                  </p>
                </div>
                
                {/* Localização */}
                <div className="flex items-center gap-2">
                  <MdLocationOn className="text-[#FF0080] text-lg flex-shrink-0" />
                  <span className="text-sm text-[#6E5963]">
                    {provider.location.neighborhood}, {provider.location.city}
                  </span>
                </div>
                
                {/* Descrição */}
                <p className="text-sm text-[#6E5963] line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>
                
                {/* Footer com avaliações */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#6E5963]">
                      {provider.reviewCount} avaliações
                    </span>
                  </div>
                  <div className="text-[#FF0080] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Ver serviços →
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
