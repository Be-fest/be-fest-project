'use client';

import { use } from 'react';
import { Header } from '@/components/Header';
import { ProviderServices } from '@/components/ProviderServices';
import { motion } from 'framer-motion';
import { MdStar, MdLocationOn, MdArrowBack } from 'react-icons/md';
import { getProviderById } from '@/data/mockProviders';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProviderPage({ params }: PageProps) {
  const id = use(params).id;
  const providerData = getProviderById(id);

  if (!providerData) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#520029] mb-4">Prestador não encontrado</h2>
          <Link
            href="/servicos"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center"
          >
            <MdArrowBack className="text-2xl text-[#F71875]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Botão Voltar */}
          <div className="mb-4">
            <Link
              href="/servicos"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors inline-block"
            >
              <MdArrowBack className="text-2xl text-[#F71875]" />
            </Link>
          </div>
          
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
                <div className="text-white">
                  <h1 className="text-3xl font-bold mb-2">{providerData.name}</h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MdStar className="text-yellow-400" />
                      <span>{providerData.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MdLocationOn />
                      <span>{providerData.location.neighborhood}, {providerData.location.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Content */}
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#520029] mb-4">Sobre</h2>
                <p className="text-gray-600">{providerData.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#520029] mb-4">Serviços</h2>
                <ProviderServices services={providerData.services} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
