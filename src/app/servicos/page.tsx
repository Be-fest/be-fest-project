'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack,
  MdSearch,
  MdStar,
  MdAdd,
  MdLocationOn,
  MdFilterList,
  MdTune,
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
    image: '/placeholder-logo.svg',
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
    image: '/placeholder-logo.svg',
    description: 'DJ profissional com equipamento completo de som e iluminação.',
  },
  {
    id: 'p3',
    name: 'Pizzaria da Vovó',
    category: 'pizzaria',
    rating: 4.7,
    price: 2800,
    location: {
      city: 'São Paulo',
      neighborhood: 'Liberdade',
      state: 'SP'
    },
    image: '/placeholder-logo.svg',
    description: 'Pizzas artesanais feitas na hora com ingredientes frescos e massa tradicional.',
  },
  {
    id: 'p4',
    name: 'Churrasco Premium',
    category: 'churrascaria',
    rating: 4.9,
    price: 4200,
    location: {
      city: 'São Paulo',
      neighborhood: 'Vila Olímpia',
      state: 'SP'
    },
    image: '/placeholder-logo.svg',
    description: 'Churrasco completo com carnes nobres e acompanhamentos tradicionais.',
  },
  {
    id: 'p5',
    name: 'Doces & Cia',
    category: 'doceria',
    rating: 4.6,
    price: 1800,
    location: {
      city: 'São Paulo',
      neighborhood: 'Jardins',
      state: 'SP'
    },
    image: '/placeholder-logo.svg',
    description: 'Doces artesanais, bolos personalizados e mesa de sobremesas.',
  },
  {
    id: 'p6',
    name: 'Burger House',
    category: 'hamburgueria',
    rating: 4.4,
    price: 2200,
    location: {
      city: 'São Paulo',
      neighborhood: 'Pinheiros',
      state: 'SP'
    },
    image: '/placeholder-logo.svg',
    description: 'Hambúrgueres gourmet com ingredientes selecionados e batatas especiais.',
  },
];

export default function ServicosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('name'); // name, price, rating

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || provider.category === selectedCategory;
    const matchesPrice = provider.price >= minPrice && provider.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MdArrowBack className="text-xl sm:text-2xl text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#520029]">Serviços</h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Encontre os melhores prestadores para sua festa
              </p>
            </div>
            <div className="hidden lg:flex items-center text-sm text-gray-500">
              {filteredProviders.length} serviços encontrados
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200">
        <Categories 
          onCategorySelect={handleCategorySelect}
          className="lg:py-6"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters - Desktop Only */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-[#520029] mb-6 flex items-center gap-2">
                <MdTune className="text-xl" />
                Filtros
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome ou serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Faixa de Preço
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <input
                        type="number"
                        min={minPrice}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none text-sm"
                >
                  <option value="name">Nome (A-Z)</option>
                  <option value="price">Menor Preço</option>
                  <option value="rating">Melhor Avaliação</option>
                </select>
              </div>

              {/* Active Filters Count */}
              {(searchTerm || selectedCategory !== 'Todas' || minPrice > 0 || maxPrice < 10000 || sortBy !== 'name') && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-purple-600 font-medium mb-1">Filtros Ativos</div>
                  <div className="text-sm text-purple-800">
                    {filteredProviders.length} de {serviceProviders.length} serviços
                  </div>
                </div>
              )}

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todas');
                  setMinPrice(0);
                  setMaxPrice(10000);
                  setSortBy('name');
                }}
                disabled={!searchTerm && selectedCategory === 'Todas' && minPrice === 0 && maxPrice === 10000 && sortBy === 'name'}
                className="w-full py-2.5 px-4 text-sm text-[#A502CA] border border-[#A502CA] rounded-lg hover:bg-[#A502CA] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#A502CA]"
              >
                Limpar Filtros
              </button>
            </div>
          </div>

          {/* Main Content - Desktop */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredProviders.map((provider, index) => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl text-purple-300">
                        {provider.category === 'buffet' && '🍽️'}
                        {provider.category === 'musica' && '🎵'}
                        {provider.category === 'pizzaria' && '🍕'}
                        {provider.category === 'churrascaria' && '🥩'}
                        {provider.category === 'doceria' && '🧁'}
                        {provider.category === 'hamburgueria' && '🍔'}
                        {!['buffet', 'musica', 'pizzaria', 'churrascaria', 'doceria', 'hamburgueria'].includes(provider.category) && '🎉'}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                      <MdStar className="text-yellow-400 text-sm" />
                      <span className="font-medium text-sm">{provider.rating}</span>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {provider.name}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#A502CA]">
                          R$ {provider.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                      <MdLocationOn className="text-[#A502CA]" />
                      {provider.location.neighborhood}, {provider.location.city}
                    </p>

                    <p className="text-gray-700 text-sm mb-6 line-clamp-2">
                      {provider.description}
                    </p>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-[#A502CA] hover:bg-[#8B0A9E] text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Ver Detalhes
                      </button>
                      <button className="p-3 border border-[#A502CA] text-[#A502CA] hover:bg-[#A502CA] hover:text-white rounded-lg transition-colors">
                        <MdAdd className="text-xl" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum serviço encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Search and Price Filter - Mobile */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">
            <div className="flex flex-col gap-4 sm:gap-6">
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
              <div className="flex-1">
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

          {/* Service Providers Grid - Mobile */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 pb-8">
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
    </div>
  );
} 