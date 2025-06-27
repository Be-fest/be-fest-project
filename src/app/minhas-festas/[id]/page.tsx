'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MdArrowBack,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdEdit,
  MdDelete,
  MdAdd,
  MdMoreVert,
  MdRefresh,
  MdCheck,
  MdClose,
  MdWarning,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyConfigForm } from '@/components/PartyConfigForm';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Service {
  id: string;
  name: string;
  provider: {
    id: string;
    name: string;
    rating: number;
    image: string;
  };
  status: 'Confirmado' | 'Pendente' | 'Recusado' | 'Cancelado';
  price: number;
  category: string;
}

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
  services: Service[];
}

// Mock data
const partyDetails: Record<string, Party> = {
  '1': {
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
    services: [
      {
        id: 's1',
        name: 'Buffet Completo',
        provider: {
          id: 'p1',
          name: 'Buffet Delícias',
          rating: 4.8,
          image: '/providers/buffet.jpg',
        },
        status: 'Confirmado',
        price: 3500,
        category: 'Alimentação',
      },
      {
        id: 's2',
        name: 'DJ e Som',
        provider: {
          id: 'p2',
          name: 'DJ Mix',
          rating: 4.5,
          image: '/providers/dj.jpg',
        },
        status: 'Pendente',
        price: 1200,
        category: 'Música',
      },
      {
        id: 's3',
        name: 'Decoração Temática',
        provider: {
          id: 'p3',
          name: 'Decor & Festa',
          rating: 4.7,
          image: '/providers/decor.jpg',
        },
        status: 'Recusado',
        price: 2800,
        category: 'Decoração',
      }
    ],
  },
  // Add more parties as needed
};

export default function PartyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const partyId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const party = partyDetails[partyId];

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isServiceMenuOpen, setServiceMenuOpen] = useState<string | null>(null);

  if (!party) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#520029] mb-4">Festa não encontrada</h2>
          <Link
            href="/minhas-festas"
            className="text-[#A502CA] hover:underline flex items-center justify-center gap-2"
          >
            <MdArrowBack />
            Voltar para lista de festas
          </Link>
        </div>
      </div>
    );
  }

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    // Temporary alert for demo
    alert('Festa atualizada com sucesso!');
  };

  const handleDelete = () => {
    // Here you would typically make an API call to delete the party
    router.push('/minhas-festas');
    // Temporary alert for demo
    alert('Festa excluída com sucesso!');
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Recusado':
        return 'bg-red-100 text-red-800';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#FFF6FB]">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/minhas-festas"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MdArrowBack className="text-2xl text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#520029]">{party.name}</h1>
                <p className="text-gray-600">
                  {new Date(party.date).toLocaleDateString('pt-BR')} às {party.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2 text-[#A502CA] border-2 border-[#A502CA] rounded-lg hover:bg-[#A502CA] hover:text-white transition-colors flex items-center gap-2"
              >
                <MdEdit />
                Editar
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="px-4 py-2 text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2"
              >
                <MdDelete />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Party Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <MdCalendarToday className="text-[#A502CA] text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-[#520029]">Data e Hora</h3>
                <p className="text-gray-600">
                  {new Date(party.date).toLocaleDateString('pt-BR')} às {party.time}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdLocationOn className="text-[#A502CA] text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-[#520029]">Local</h3>
                <p className="text-gray-600">{party.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MdPeople className="text-[#A502CA] text-xl mt-1" />
              <div>
                <h3 className="font-semibold text-[#520029]">Convidados</h3>
                <p className="text-gray-600">
                  {party.guests.full} adultos, {party.guests.half} crianças (5-12),{' '}
                  {party.guests.free} crianças (0-4)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#520029]">Serviços</h2>
              <button
                className="px-4 py-2 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B0A9E] transition-colors flex items-center gap-2"
                onClick={() => router.push('/servicos')}
              >
                <MdAdd />
                Adicionar Serviço
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {party.services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#520029]">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.provider.name}</p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setServiceMenuOpen(service.id === isServiceMenuOpen ? null : service.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MdMoreVert className="text-gray-500" />
                        </button>
                        <AnimatePresence>
                          {isServiceMenuOpen === service.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                            >
                              <div className="py-1">
                                {(service.status === 'Recusado' || service.status === 'Cancelado') ? (
                                  <button
                                    onClick={() => {
                                      setServiceMenuOpen(null);
                                      router.push('/servicos');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <MdRefresh />
                                    Encontrar Novo Prestador
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setServiceMenuOpen(null);
                                      // Handle cancel
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <MdClose />
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                      <span className="font-semibold text-[#520029]">
                        {formatCurrency(service.price)}
                      </span>
                    </div>

                    {service.status === 'Pendente' && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                        <MdWarning className="text-yellow-500 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Aguardando confirmação do prestador. Você será notificado quando houver uma resposta.
                        </p>
                      </div>
                    )}

                    {service.status === 'Recusado' && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                        <MdWarning className="text-red-500 mt-0.5" />
                        <p className="text-sm text-red-600">
                          O prestador não pôde atender sua solicitação. Você pode tentar encontrar outro prestador.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-[#A502CA] to-[#8B0A9E] p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold">Editar Festa</h2>
                    <p className="text-purple-100">Atualize os detalhes da sua festa</p>
                  </div>
                  <button
                    onClick={() => setEditModalOpen(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <MdClose className="text-2xl" />
                  </button>
                </div>
              </div>

              <PartyConfigForm
                onComplete={handleEditSuccess}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Excluir Festa"
        message="Tem certeza que deseja excluir esta festa? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
} 