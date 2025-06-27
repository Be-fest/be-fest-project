'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MdAdd,
  MdSearch,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdFilterList,
  MdClose,
  MdMoreVert,
  MdArrowBack,
} from 'react-icons/md';
import { motion } from 'framer-motion';
import { NewPartyModal } from '@/components/NewPartyModal';

interface Party {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  guests: {
    full: number;
    half: number;
    free: number;
  };
  status: 'Planejamento' | 'Confirmada' | 'Realizada' | 'Cancelada';
  totalServices: number;
  confirmedServices: number;
}

// Mock data
const parties: Party[] = [
  {
    id: '1',
    name: 'Aniversário da Ana',
    date: '2024-08-15',
    time: '19:00',
    location: 'Rua das Flores, 123, São Paulo, SP',
    guests: {
      full: 30,
      half: 15,
      free: 5,
    },
    status: 'Planejamento',
    totalServices: 8,
    confirmedServices: 3,
  },
  {
    id: '2',
    name: 'Casamento João e Maria',
    date: '2024-09-20',
    time: '20:00',
    location: 'Buffet Elegance, Av. Principal, 500',
    guests: {
      full: 150,
      half: 20,
      free: 10,
    },
    status: 'Confirmada',
    totalServices: 12,
    confirmedServices: 12,
  },
  // Add more mock parties here
];

export default function MinhasFestasPage() {
  const router = useRouter();
  const [isNewPartyModalOpen, setNewPartyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Party['status'] | 'Todas'>('Todas');

  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todas' || party.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePartySuccess = () => {
    setNewPartyModalOpen(false);
    // Temporary alert for demo
    alert('Festa criada com sucesso!');
  };

  const getStatusColor = (status: Party['status']) => {
    switch (status) {
      case 'Planejamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'Realizada':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6FB] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-[#520029] hover:text-[#A502CA] transition-colors mb-6 font-medium"
        >
          <MdArrowBack className="mr-2 text-xl" />
          Voltar para Home
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#520029]">Minhas Festas</h1>
            <p className="text-gray-600 mt-1">
              Gerencie todas as suas festas em um só lugar
            </p>
          </div>

          <button
            onClick={() => setNewPartyModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors font-medium gap-2"
          >
            <MdAdd className="text-xl" />
            Nova Festa
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Buscar festas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <MdFilterList className="text-gray-500 text-xl" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Party['status'] | 'Todas')}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none"
              >
                <option value="Todas">Todas</option>
                <option value="Planejamento">Planejamento</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Realizada">Realizada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Party Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party) => (
            <motion.div
              key={party.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-[#520029] mb-2">
                    {party.name}
                  </h3>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MdMoreVert className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MdCalendarToday className="mr-2" />
                    <span>
                      {new Date(party.date).toLocaleDateString('pt-BR')} às {party.time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MdLocationOn className="mr-2" />
                    <span className="line-clamp-1">{party.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MdPeople className="mr-2" />
                    <span>
                      {party.guests.full + party.guests.half + party.guests.free} convidados
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(party.status)}`}>
                    {party.status}
                  </span>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{party.confirmedServices}</span>
                    <span className="mx-1">/</span>
                    <span>{party.totalServices}</span>
                    <span className="ml-1">serviços</span>
                  </div>
                </div>

                <Link
                  href={`/minhas-festas/${party.id}`}
                  className="mt-4 block w-full text-center px-4 py-2 border-2 border-[#A502CA] text-[#A502CA] rounded-lg hover:bg-[#A502CA] hover:text-white transition-colors font-medium"
                >
                  Ver Detalhes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredParties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm || statusFilter !== 'Todas'
                ? 'Nenhuma festa encontrada com os filtros atuais'
                : 'Você ainda não tem nenhuma festa cadastrada'}
            </p>
            <button
              onClick={() => setNewPartyModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors font-medium gap-2"
            >
              <MdAdd className="text-xl" />
              Criar Minha Primeira Festa
            </button>
          </div>
        )}
      </div>

      {/* New Party Modal */}
      <NewPartyModal
        isOpen={isNewPartyModalOpen}
        onClose={() => setNewPartyModalOpen(false)}
        onSuccess={handleCreatePartySuccess}
      />
    </div>
  );
} 