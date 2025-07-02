'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack,
  MdSearch,
  MdStar,
  MdAdd,
  MdLocationOn,
} from 'react-icons/md';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Categories } from '@/components/Categories';

interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  price: number;
  location: {
    city: string;
    neighborhood: string;
    state: string;
  };
  image: string;
  description: string;
}

// Mock data
const serviceProviders: ServiceProvider[] = [
  {
    id: 'p1',
    name: 'Buffet Delícias',
    category: 'buffet',
    rating: 4.8,
    price: 3500,
    location: {
      city: 'São Paulo',
      neighborhood: 'Centro',
      state: 'SP'
    },
    image: '/images/providers/buffet.jpg',
    description: 'Buffet completo para festas, incluindo entrada, prato principal, sobremesas e bebidas.',
  },
  {
    id: 'p2',
    name: 'DJ Mix',
    category: 'musica',
    rating: 4.5,
    price: 1200,
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Mariana',
      state: 'SP'
    },
    image: '/images/providers/dj.jpg',
    description: 'DJ profissional com equipamento completo de som e iluminação.',
  },
];

export default function ServicosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || provider.category === selectedCategory;
    const matchesPrice = provider.price >= minPrice && provider.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-[#FFF6FB]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-2 sm:gap-4">
            <Link
              href="/minhas-festas"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MdArrowBack className="text-xl sm:text-2xl text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#520029]">Serviços</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Encontre os melhores prestadores para sua festa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <Categories 
        onCategorySelect={handleCategorySelect}
        className="mb-8 shadow-sm"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Price Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
                <input
                  type="text"
                  placeholder="Buscar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Price Filter */}
            <div className="flex-1 lg:max-w-md">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Faixa de Preço
                </label>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                      placeholder="0"
                    />
                  </div>
                  <span className="text-gray-400 text-sm">até</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                    <input
                      type="number"
                      min={minPrice}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Providers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-8">
          {filteredProviders.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="relative w-full h-40 sm:h-48">
                <Image
                  src={provider.image}
                  alt={provider.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    {provider.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <MdStar className="text-yellow-400" />
                    <span className="font-medium text-sm sm:text-base">{provider.rating}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mb-4">
                  <MdLocationOn />
                  {provider.location.neighborhood}, {provider.location.city}
                </p>

                <p className="text-gray-700 text-xs sm:text-sm mb-4 sm:mb-6">
                  {provider.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-lg sm:text-xl font-bold text-[#A502CA]">
                    R$ {provider.price.toLocaleString()}
                  </div>
                  <button className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 