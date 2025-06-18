'use client';

import { Header } from '@/components/Header';
import { ProviderServices } from '@/components/ProviderServices';
import { motion } from 'framer-motion';
import { MdStar, MdLocationOn } from 'react-icons/md';
import { getProviderById } from '@/data/mockProviders';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProviderPage({ params }: PageProps) {
  // Buscar dados do prestador pelos dados mock
  const providerData = getProviderById(params.id);
  
  if (!providerData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Prestador não encontrado</h1>
            <p className="text-gray-600">O prestador que você está procurando não existe.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F9' }}>
      <Header />
      
      {/* Hero Section */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Provider Header */}
            <div className="relative h-64 bg-gradient-to-r from-[#520029] to-[#FF0080]">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <img
                src={providerData.image}
                alt={providerData.name}
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute bottom-6 left-6 flex items-end gap-6">
                <div className="w-24 h-24 rounded-xl bg-white p-2 shadow-lg">
                  <img
                    src={providerData.image}
                    alt={`${providerData.name} logo`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-white pb-2">
                  <h1 className="text-3xl font-bold mb-2">{providerData.name}</h1>
                  <p className="text-pink-100 mb-2">{providerData.category}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MdStar className="text-yellow-400 text-xl" />
                      <span className="font-semibold">{providerData.rating}</span>
                      <span className="text-pink-100">({providerData.reviewCount} avaliações)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MdLocationOn className="text-pink-200 text-lg" />
                      <span className="text-pink-100">
                        {providerData.location.neighborhood}, {providerData.location.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Provider Info */}
            <div className="p-6">
              <p className="text-[#6E5963] text-lg leading-relaxed mb-6">
                {providerData.description}
              </p>

              {/* Services Title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#520029] border-b-2 border-[#FF0080] inline-block pb-2">
                  Serviços Principais
                </h2>
              </div>
            </div>
          </motion.div>
        </div>
      </div>      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <ProviderServices services={providerData.services} />
      </div>
    </div>
  );
}
