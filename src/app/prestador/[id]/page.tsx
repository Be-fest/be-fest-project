'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProviderServices } from '@/components/ProviderServices';
import { ProviderBudget } from '@/components/ProviderBudget';
import { motion } from 'framer-motion';
import { MdStar, MdLocationOn } from 'react-icons/md';

// Mock data - em uma aplicação real viria da API
const providerData = {
  id: '1',
  name: "Barreto's Buffet",
  category: 'Comida e Bebida',
  subcategory: 'Serviços de Buffet',
  rating: 4.8,
  reviews: 156,
  image: '/images/outros/provider1.png',
  logo: '/images/outros/provider1.png',
  city: 'São Paulo',
  neighborhood: 'Vila Madalena',
  description: 'Especialistas em buffet completo para festas e eventos. Comida de qualidade, serviço impecável e preços justos.',
  services: [
    {
      id: 1,
      category: 'Linha Churras',
      items: [
        {
          id: 1,
          name: 'Churras Master',
          description: 'Mín de 30 convidados',
          price: 140.00,
          image: '/images/categories/comida-bebida.png'
        },
        {
          id: 2,
          name: 'Churras Gold',
          description: 'Mín de 30 convidados',
          price: 100.00,
          image: '/images/categories/comida-bebida.png'
        },
        {
          id: 3,
          name: 'Churras Silver',
          description: 'Mín de 30 convidados',
          price: 80.00,
          image: '/images/categories/comida-bebida.png'
        },
        {
          id: 4,
          name: 'Rodízio Churras',
          description: 'Mín de 30 convidados',
          price: 60.00,
          image: '/images/categories/comida-bebida.png'
        }
      ]
    },
    {
      id: 2,
      category: 'Linha Gourmet',
      items: [
        {
          id: 5,
          name: 'Almoço/Jantar',
          description: 'Mín de 50 convidados',
          price: 85.00,
          image: '/images/categories/comida-bebida.png'
        },
        {
          id: 6,
          name: 'Buffet Infantil',
          description: 'Mín de 50 convidados',
          price: 55.00,
          image: '/images/categories/comida-bebida.png'
        },
        {
          id: 7,
          name: 'Coffee Break',
          description: 'Mín de 30 convidados',
          price: 25.00,
          image: '/images/categories/comida-bebida.png'
        },
        {
          id: 8,
          name: 'Cocktail',
          description: 'Mín de 30 convidados',
          price: 75.00,
          image: '/images/categories/comida-bebida.png'
        }
      ]
    },
    {
      id: 3,
      category: 'Massas',
      items: [
        {
          id: 9,
          name: 'Massas',
          description: 'Mín de 50 convidados',
          price: 90.00,
          image: '/images/categories/comida-bebida.png'
        }
      ]
    }
  ]
};

export default function ProviderPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'services' | 'budget'>('services');
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F9' }}>
      <Header />
      
      {/* Provider Header */}
      <div className="bg-white shadow-sm pt-20">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Provider Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-white shadow-lg flex-shrink-0"
            >
              <img 
                src={providerData.logo} 
                alt={providerData.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Provider Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-[#520029] mb-2">
                {providerData.name}
              </h1>
              <p className="text-lg text-[#6E5963] mb-4">
                {providerData.category} | {providerData.subcategory}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <MdStar className="text-yellow-400 text-xl" />
                  <span className="font-semibold text-[#520029]">{providerData.rating}</span>
                  <span className="text-[#6E5963]">({providerData.reviews} avaliações)</span>
                </div>
              </div>              {/* Location Info */}
              <div className="flex items-center gap-1 text-sm text-[#6E5963] mb-4">
                <MdLocationOn className="text-[#FF0080]" />
                <span>{providerData.city} - {providerData.neighborhood}</span>
              </div>

              <p className="text-[#6E5963] leading-relaxed">
                {providerData.description}
              </p>
            </motion.div>
          </div>
        </div>
      </div>      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'services'
                  ? 'border-[#FF0080] text-[#FF0080]'
                  : 'border-transparent text-[#6E5963] hover:text-[#520029]'
              }`}
            >
              Serviços Principais
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === 'budget'
                  ? 'border-[#FF0080] text-[#FF0080]'
                  : 'border-transparent text-[#6E5963] hover:text-[#520029]'
              }`}
            >
              Orçamento
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {activeTab === 'services' && (
          <ProviderServices services={providerData.services} />
        )}
        {activeTab === 'budget' && (
          <ProviderBudget services={providerData.services} />
        )}
      </div>
    </div>
  );
}
